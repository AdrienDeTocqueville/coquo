import App from '/dist/circular.js'
import Router from '/dist/router.js'

// STUFF

const TAGS = ["Tarte", "Patisserie", "Gateau", "Pâte"];
const UNITS = ["g", "kg", "mL", "L"];

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

router.addRoute("#/(new-recipe|edit/([A-Za-z0-9]+))", {
	view: `
        <div class="container">
            <form class="recipe-form">

              <!-- Recipe Name -->
              <div class="form-group">
                <h2>Nouvelle Recette</h2>
                <input type="text" placeholder="Nom de la recette" c-model="name" required>
              </div>

              <!-- Cooking Time -->
              <div class="form-group" style="display: flex; gap: 25px">
                <input type="text" placeholder="Temps de cuisson" min="1" c-model="cooking_time" required>
                <input type="text" placeholder="Temps de preparation" min="1" c-model="prep_time" required>
              </div>


              <!-- Multi-Tag Combo Box -->
              <div class="form-group">
                <h2>Tags</h2>
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
              <div class="form-group" style="position: relative">
                <h2>Ingrédients</h2>

                <i c-on:click="add_recipe_link()" class="add-group fa-regular fa-square-plus"></i>

                <div class="ingredient-list">
                    <div c-for="link in recipe_links" class="ingredient-group">

                        <input c-on:input="handle_count(link)" style="width: 150px" type="number" placeholder="Quantité" min="1" required>

                        <div style="position: relative; width: 100%">
                            <input c-on:input="handle_link(link)" type="text" placeholder="Recette..." required>
                            <ul class="suggestions"></ul>
                        </div>

                        <i style="cursor: pointer" c-on:click="delete_link(link);" class="fa-regular fa-trash-can"></i>
                    </div>

                    <textarea c-model="ingredients" id="ingredients" placeholder="List each ingredient on a new line" rows="3" required></textarea>
                </div>
              </div>

              <!-- Steps -->
              <div class="form-group">
                <h2>Étapes</h2>
                <textarea placeholder="Describe each step on a new line" rows="20" c-model="steps" required></textarea>
              </div>

              <!-- Submit -->
              <button class="big-button" type="submit">{{submit_text}}</button>
            </form>
        </div>
	`,
    model: {
        name: "",
        cooking_time: "", prep_time: "",
        tags: [],
        recipe_links: [],
        ingredients: "",
        steps: "",
        filtering: false,
        submit_text: "",
        current_hash: null,
    },
    controller: {
        find_link: function(link) {
            for (let i = 0; i < this.recipe_links.length; i++)
            {
                if (this.recipe_links[i] === link)
                    return i;
            }
            return 0;
        },
        add_recipe_link: function() {
            let links = this.recipe_links.slice(); // shallow copy
            links.push({count: 1, link: ""});
            this.recipe_links = links;
        },
        delete_link: function(link) {
            let links = this.recipe_links.slice(); // shallow copy
            links.splice(this.find_link(link), 1);
            this.recipe_links = links;
        },
        handle_count: function(link) {
            const input = document.activeElement;
            let idx = this.find_link(link);
            this.recipe_links[idx].count = input.value;
        },
        handle_link: function(link) {
            if (this.filtering) return;
            this.filtering = true;

            const input = document.activeElement;
            const suggestions = input.nextSibling;

            const value = input.value.toLowerCase();
            suggestions.innerHTML = "";

            if (!value) {
                suggestions.style.display = "none";
                this.filtering = false;
                return;
            }

            DB.load_descriptors().then((descriptors) => {

                const filtered = descriptors.filter(item => item.name.toLowerCase().includes(value));

                if (filtered.length === 0) {
                    suggestions.style.display = "none";
                    this.filtering = false;
                    return;
                }

                filtered.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = item.name;

                    li.addEventListener("click", () => {
                        input.value = item.name;
                        suggestions.style.display = "none";

                        let idx = this.find_link(link);
                        this.recipe_links[idx].link = item.hash;
                    });

                    suggestions.appendChild(li);
                });

                suggestions.style.display = "block";
                this.filtering = false;
            });

        },
        submit_form: function() {

            let hash = this.current_hash != null ? this.current_hash : randomString(10); // Hope it doesn't collide

            let desc = {
                name: this.name,
                tags: this.tags
            };

            let recipe = {
                cooking_time: this.cooking_time,
                prep_time: this.prep_time,
                ingredients: this.parse_ingredients(),
                steps: this.parse_steps(),
            }

            DB.set_recipe(hash, desc, recipe)
                .then(() => this.$router.goto("#/" + hash));
        },

        extract_leading_number: function(str) {
            str = str.trim();

            let numberStr = "";
            let hasDecimal = false;

            let i = 0;
            for (; i < str.length; i++) {
                const char = str[i];

                if (char >= '0' && char <= '9') {
                    continue;
                }
                else if ((char === '.' || char === ',') && !hasDecimal) {
                    continue;
                    hasDecimal = true;
                }
                else {
                    break; // stop at first non-number character
                }
            }

            return i == 0 ? null : {
                count: str.substr(0, i),
                rest: str.substr(i).trim()
            };
        },

        parse_ingredients: function() {
            let result = [];
            let lines = this.ingredients.split("\n");
            for (let i = 0; i < lines.length; i++)
            {
                let lead = this.extract_leading_number(lines[i]);
                if (lead == null) continue;

                const spaceIndex = lead.rest.indexOf(" ");
                if (spaceIndex === -1) { // No unit
                    result.push({ count: lead.count, unit: "", item: lead.rest });
                }
                else {
                    let unit = lead.rest.slice(0, spaceIndex);
                    let item = lead.rest.substr(spaceIndex).trim();
                    result.push({ count: lead.count, unit: unit, item: item });
                }
            }
            return result;
        },

        unparse_ingredients: function(ingredients) {
            let result = "";
            for (let ingredient of ingredients)
                result += ingredient.count + ingredient.unit + " " + ingredient.item + "\n";
            return result;

        },

        parse_steps: function() {
            let lines = this.steps.split("\n\n");
            lines = lines.filter((line) => line.trim().length != 0);

            let result = [];
            for (let i = 0; i < lines.length; i++)
            {
                let notes = [];
                while (true)
                {
                    let note_start = lines[i].indexOf("--");
                    if (note_start === -1) break;

                    let note_end = lines[i].indexOf("--", note_start + 1);
                    if (note_end === -1) break;

                    notes.push(lines[i].slice(note_start + 2, note_end).trim());
                    lines[i] = lines[i].slice(0, note_start) + lines[i].slice(note_end + 2)
                }

                result.push({ txt: lines[i].trim(), notes });
            }

            return result;
        },

        unparse_steps: function(steps) {
            let result = "";
            for (let step of steps)
            {
                result += step.txt + "\n";
                for (let note of step.notes)
                    result += "--\n" + note + "\n--\n";
                result += "\n";
            }
            return result;
        },

        onShow: function() {
            const form = document.querySelector('.recipe-form');

            // Clear data
            this.name = "";
            this.tags = [];
            this.cooking_time = "";
            this.prep_time = "";
            this.recipe_links = [];
            this.ingredients = "";
            this.steps = "";
            this.submit_text = "Enregistrer la recette";
            this.current_hash = null;
            document.title = "Nouvelle Recette";

            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent page reload
                router.currentComponent.submit_form();
            });

            if (router.params.length == 3)
            {
                let hash = router.params[2];
                DB.get_recipe(hash).then((result) => {
                    this.name = result.desc.name;
                    this.tags = result.desc.tags;
                    this.cooking_time = result.recipe.cooking_time;
                    this.prep_time = result.recipe.prep_time;
                    this.ingredients = this.unparse_ingredients(result.recipe.ingredients);
                    this.steps = this.unparse_steps(result.recipe.steps);
                    this.submit_text = "Sauvegarder les modifications";
                    this.current_hash = hash;
                    document.title = "Modifier la Recette";
                });
            }
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
                        <i c-on:click="do_edit()" class="fa-regular fa-pen-to-square"></i>
                        <i c-on:click="ask_deletion = true" class="fa-regular fa-trash-can"></i>
                    </div>
                </div>

                <hr>

                <h6>Ingrédients</h6>
                <ul>
                    <li class="ingredient" c-for="i in recipe.ingredients">{{i.count}}{{i.unit}} {{i.item}}</li>
                </ul>

                <h6>Étapes</h6>
                <ol class="steps">
                    <li class="step" c-for="s in recipe.steps">{{s.txt}}
                        <div class="help-note" c-for="n in s.notes">{{n}}</div>
                    </li>
                </ol>
		    </div>

            <div c-if="ask_deletion" id="modal">
                <div class="modal-content">
                    <h5 style="margin-top: 20px; margin-bottom: 20px">La suppression est définitive !</h5>
                    <hr>
                    <div style="display: flex; grid-gap: 40px; margin: 20px;">
                        <button c-on:click="ask_deletion=false" status="primary" class="btn btn-primary">Annuler</button>
                        <button c-on:click="do_delete()" status="danger" class="btn btn-danger">Supprimer</button>
                    </div>
                </div>
            </div>
		</div>
	`,
    model: {
        recipe: null,
        ask_deletion: false,
    },

    controller: {
        do_edit: function() {
            router.goto("#/edit/" + this.recipe.hash);
        },
        do_delete: function() {
            this.ask_deletion = false;
            DB.delete_recipe(this.recipe.hash)
                .then(() => this.$router.goto(this.$router.defaultRoute));
        },
        onShow: function() {
            let hash = this.$router.route.substr(2);
            DB.get_recipe(hash).then((result) => {
                let desc = result.desc;
                let recipe = result.recipe;

                this.recipe = {
                    name: desc.name,
                    hash: hash,
                    tags: desc.tags,
                    cooking_time: recipe.cooking_time,
                    prep_time: recipe.prep_time,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps
                };

                document.title = desc.name;

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
