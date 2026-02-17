import { app, router } from './main.js'

router.addRoute("#/home", {
	view: `
		<div class="recipe-group container">
            <recipeList c-init:tag="$parent.$parent.TAGS[0]"></recipeList>
            <recipeList c-init:tag="$parent.$parent.TAGS[2]"></recipeList>
            <recipeList c-init:tag="$parent.$parent.TAGS[4]"></recipeList>
            <recipeList c-init:tag="$parent.$parent.TAGS[3]"></recipeList>
            <recipeList c-init:tag="$parent.$parent.TAGS[1]"></recipeList>

            <button class="big-button floating-btn" id="new-recipe" c-on:click="$router.goto('#/new-recipe')">
                <i class="fa-solid fa-plus"></i> Nouvelle Recette
            </button>
		</div>
	`,
    controller: {
        onShow: function() {
            document.title = "Coquo";
        }
    },

    components: {
        recipeList: {
            view: `
                <div>
                    <h2>{{get_plural(tag)}}</h2>
                    <div class="recipe-container">
                        <a c-for="r in recipes" class="recipe-card" c-bind:href="get_url(r)">
                            <h2 class="recipe-name">{{r.name}}</h2>
                            <div class="tags">
                                <span class="tag" c-for="tag in r.tags">{{tag}}</span>
                            </div>
                        </a>
                    </div>
                </div>
            `,
            model: {
                tag: "",
                recipes: []
            },
            controller: {
                get_plural: function(tag) {
                    let r = this.$parent.$parent;
                    return r.TAGS_PLURAL[r.TAGS.indexOf(tag)];
                },
                get_url: function(recipe) {
                    return '#/' + recipe.hash;
                },
                onShow: function() {
                    DB.load_descriptors().then((descriptors) => {
                        this.recipes = descriptors.filter(desc => desc.tags.indexOf(this.tag) != -1);
                    });
                }
            },
        }
    }
});
