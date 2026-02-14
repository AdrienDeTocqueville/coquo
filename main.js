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

        load_descriptors();
    }
});

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
            <a c-for="r in recipes" class="recipe-card" c-on:click="$router.goto(r.hash)">
                <h2 class="recipe-name">{{r.name}}</h2>
                <div class="tags">
                    <span class="tag" c-for="tag in r.tags">{{tag}}</span>
                </div>
            </a>

            <button class="floating-btn" id="new-recipe" c-on:click="$router.goto('#/new-recipe')">
                <svg id="plus-svg" width="24" height="24" viewBox="0 0 24 24" focusable="false"><path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z"></path></svg>
                Nouvelle Recette
            </button>
		</div>
	`,
    model: {
        recipes: []
    }
}, load_descriptors);

router.addRoute("#/new-recipe", {
	view: `
		<div> ADD RECIPE
		</div>
	`,
    model: {
    }
});

router.addRoute("#/*", {
	view: `
		<div> HELLO
		</div>
	`,
    model: {
    }
});

app.mount();

// DESCRIPTORS

function load_descriptors() {
    db.collection("descriptors").get()
        .then((querySnapshot) => {
            let descriptors = [];
            querySnapshot.forEach((doc) => {
                let desc = doc.data();
                desc.hash = doc.id;
                descriptors.push(desc);
            });
            if (router.route == "#/home")
                router.currentComponent.recipes = descriptors;
        })
        .catch((error) => {
            console.error("Error getting recipe descriptors:", error);
        });
}

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

function add_recipe() {

    let name = "Tarte aux fraises";
    let tags = ["Dessert", "Tarte"];
    let hash = randomString(10);

    db.collection("descriptors").doc(hash).set({
        name: name,
        tags: tags
    })
    .then(() => {
        console.log("Recipe descriptor added!");
    })
    .catch((error) => {
        console.error("Error writing descriptor:", error);
    });
}

document.querySelector("#title").addEventListener("click", () => {
    router.goto('#/home');
});
