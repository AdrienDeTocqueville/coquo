import App from '/dist/circular.js'
import Router from '/dist/router.js'

// FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyAOsghOEPYUmr1L-y8iX0feFau79dcxfBQ",
    authDomain: "coquo-pat.firebaseapp.com",
    projectId: "coquo-pat",
    storageBucket: "coquo-pat.firebasestorage.app",
    messagingSenderId: "230128169014",
    appId: "1:230128169014:web:71be33fe9ee35c7e1aa897"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ui = new firebaseui.auth.AuthUI(auth);
const uiConfig = {
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            console.log("User signed in:", authResult.user.displayName);
            return false; // Prevent redirect
        }
    },
    signInFlow: 'popup'
};

auth.onAuthStateChanged(user => {
    if (user == null)
    {
        let signIn = document.querySelector("#firebaseui-auth-container");
        signIn.style.display = "block";

        ui.start('#firebaseui-auth-container', uiConfig);
    }
    else
    {
        let profilePic = document.querySelector("#profile-img");
        profilePic.src = user.photoURL;
        profilePic.style.display = "block";

        console.log("User signed in:", user.displayName);
    }
});

let DB = {
    descriptors: null,

    load_descriptors: function() {
        if (DB.descriptors != null)
        {
            return new Promise((resolve) => { resolve(DB.descriptors); });
        }

        return db.collection("descriptors").get()
            .then((querySnapshot) => {
                DB.descriptors = [];
                querySnapshot.forEach((doc) => {
                    let desc = doc.data();
                    desc.hash = doc.id;
                    DB.descriptors.push(desc);
                });

                return DB.descriptors;
            })
            .catch((error) => {
                console.error("Error getting recipe descriptors:", error);
                return null;
            });
    }
};

// CIRCULAR

let app = new App({
    selector: "recipes",
    view: "<router> </router>"
});

let router = new Router({
	app,
	selector: "router",
	defaultRoute: "#/home",
	notFoundRoute: "#/404"
});

router.addRoute("#/home", {
	view: `
		<div class="recipe-container">
            <a c-for="r in recipes" class="recipe-card" c-bind:href="getURL(r)">
                <h2 class="recipe-name">{{r.name}}</h2>
                <div class="tags">
                    <span class="tag" c-for="tag in r.tags">{{tag}}</span>
                </div>
            </a>

            <button class="big-button floating-btn" id="new-recipe" c-on:click="$router.goto('#/new-recipe')">
                <svg id="plus-svg" width="24" height="24" viewBox="0 0 24 24" focusable="false"><path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z"></path></svg>
                Nouvelle Recette
            </button>
		</div>
	`,
    model: {
        recipes: []
    },
    controller: {
        getURL: function(recipe) {
            return '#/' + recipe.hash;
        },
        onShow: function() {
            document.title = "Coquo";

            DB.load_descriptors().then((descriptors) => { this.recipes = descriptors; });
        }
    }
});

router.addRoute("#/new-recipe", {
	view: `
        <div class="container">
            <form class="recipe-form">

              <!-- Recipe Name -->
              <div class="form-group">
                <label>Nouvelle Recette</label>
                <input type="text" placeholder="Nom de la recette" c-model="name" required>
              </div>

              <!-- Cooking Time -->
              <div class="form-group" style="display: flex; gap: 25px">
                <input type="text" placeholder="Temps de cuisson" min="1" c-model="cooking_time" required>
                <input type="text" placeholder="Temps de preparation" min="1" c-model="prep_time" required>
              </div>


              <!-- Multi-Tag Combo Box -->
              <div class="form-group">
                <label>Tags</label>
                <div class="tag-input-container">
                  <div class="tags" id="tags-container"></div>
                  <input list="tag-options" id="tag-input" placeholder="Type to add a tag">
                  <datalist id="tag-options">
                    <option value="Vegan">
                    <option value="Vegetarian">
                    <option value="Dessert">
                    <option value="Quick">
                    <option value="Healthy">
                    <option value="Dinner">
                    <option value="Lunch">
                  </datalist>
                </div>
                <small>Press Enter or select from dropdown to add multiple tags</small>
              </div>

              <!-- Ingredients -->
              <div class="form-group">
                <label>Ingrédients</label>
                <textarea placeholder="List each ingredient on a new line" rows="5" c-model="ingredients" required></textarea>
              </div>

              <!-- Steps -->
              <div class="form-group">
                <label>Étapes</label>
                <textarea placeholder="Describe each step on a new line" rows="7" c-model="steps" required></textarea>
              </div>

              <!-- Submit -->
              <button class="big-button" type="submit">Create Recipe</button>
            </form>
        </div>
	`,
    model: {
        name: "",
        cooking_time: "", prep_time: "",
        tags: [],
        ingredients: "",
        steps: ""
    },
    controller: {
        submit_form: function() {

            let hash = randomString(10); // Hope it doesn't collide
            let parsed_ingredients = this.parse_ingredients();
            let parsed_steps = this.parse_steps();

            db.collection("descriptors").doc(hash).set({
                name: this.name,
                tags: this.tags
            })
            .then(() => {
                db.collection("recipes").doc(hash).set({
                    cooking_time: this.cooking_time,
                    prep_time: this.prep_time,
                    ingredients: parsed_ingredients,
                    steps: parsed_steps,
                })
                .then(() => {
                    this.$router.goto("#/" + hash);
                })
                .catch((error) => {
                    console.error("Error writing recipe (TODO erase descriptor):", error);
                });
            })
            .catch((error) => {
                console.error("Error writing descriptor:", error);
            });
        },

        parse_ingredients: function() {
            return [
                { count: 100, unit: "g", name: "beurre" },
                { count: 200, unit: "mL", name: "lait" },
            ];
            let lines = this.ingredients.split("\n");
            return lines;
        },

        parse_steps: function() {
            return [
                { txt: "Prechauffer le four" },
                { txt: "Melanger", notes: ["Faire ca bien", "Et avec amour"] },
            ];
            let lines = this.steps.split("\n\n");
            return lines;
        },

        onShow: function() {
            const form = document.querySelector('.recipe-form');

            document.title = "Nouvelle Recette";
            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent page reload
                router.currentComponent.submit_form();
            });
        }
    }
});


router.addRoute("#/*", {
	view: `
        <div class="container">
            <div c-if="recipe != null">
                <div class="recipe-header">
                    <h1>{{recipe.name}}</h1>

                    <div class="additional">
                        <div class="additional-item">
                            <img src="/img/preparation.svg" class="icon">
                            <span>{{recipe.cooking_time}}</span>
                        </div>
                        <div class="additional-item">
                            <img src="/img/cuisson.svg" class="icon">
                            <span>{{recipe.prep_time}}</span>
                        </div>
                    </div>

                    <div class="additional-actions">
                        <i c-on:click="this.edit();" class="fa-regular fa-pen-to-square"></i>
                        <i c-on:click="this.delete();" class="fa-regular fa-trash-can"></i>
                    </div>
                </div>

                <hr>

                <h6>Ingrédients</h6>
                <ul>
                    <li class="ingredient" c-for="i in recipe.ingredients">{{i.count}}{{i.unit}} de {{i.name}}</li>
                </ul>

                <h6>Étapes</h6>
                <ol class="steps">
                    <li class="step" c-for="s in recipe.steps">{{s.txt}}
                        <div class="help-note" c-for="n in s.notes">{{n}}</div>
                    </li>
                </ol>
		    </div>
		</div>
	`,
    model: {
        recipe: null
    },

    controller: {
        edit: function() {
            // open recipe editor
        },
        delete: function() {
            // ask for confirmation
            // delete desc + recipe
        },
        onShow: function() {
            let hash = this.$router.route.substr(1);
            let desc, recipe;
            db.collection("descriptors").doc(hash).get()
                .then((doc) => {
                    if (!doc.exists)
                        reject("recipe doesn't exist")
                    desc = doc.data();

                    db.collection("recipes").doc(hash).get()
                        .then((doc) => {
                            recipe = doc.data();

                            for (let step of recipe.steps)
                            {
                                if (step.notes == undefined)
                                    step.notes = []
                            }

                            this.recipe = {
                                name: desc.name,
                                tags: desc.tags,
                                cooking_time: recipe.cooking_time,
                                prep_time: recipe.prep_time,
                                ingredients: recipe.ingredients,
                                steps: recipe.steps
                            };

                            document.title = desc.name;
                        })
                        .catch((error) => {
                            console.error("Error getting recipe (TODO: stale descriptor, erase it):", error);
                        });
                })
                .catch((error) => {
                    // Recipe doesn't exist, redirect home
                    this.$router.goto(this.$router.defaultRoute);
                });

        },
        onHide: function() {
            this.recipe = null;
        }
    }
});

app.mount();

// STUFF

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

document.querySelector("#title").addEventListener("click", () => {
    router.goto(router.defaultRoute);
});
