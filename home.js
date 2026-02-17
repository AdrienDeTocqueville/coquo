import { app, router } from './main.js'

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
                <i class="fa-solid fa-plus"></i> Nouvelle Recette
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
