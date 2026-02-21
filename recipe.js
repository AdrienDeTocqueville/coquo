import { app, router } from './main.js'

router.addRoute("#/*", {
	view: `
        <div>
            <div c-for="recipe in recipes" class="container">
                <div class="recipe-header">
                    <h1>{{recipe.name}}</h1>

                    <div class="additional">
                        <div class="additional-item">
                            <img src="./img/preparation.svg" class="icon">
                            <span>{{recipe.prep_time}}</span>
                        </div>
                        <div class="additional-item">
                            <img src="./img/cuisson.svg" class="icon">
                            <span>{{recipe.cooking_time}}</span>
                        </div>

                        <div c-if="is_main_recipe(recipe)" class="additional-item" style="margin-left: auto">
                            <input style="width: 80px" type="number" min="1" c-model:change="recipe.count_req">
                            <span>{{recipe.unit}}</span>
                        </div>
                        <div c-if="!is_main_recipe(recipe)" class="additional-item" style="margin-left: auto">
                            <span>
                                {{$parent.format_ingredient({count: recipe.count, unit: recipe.unit}, get_count_scale(recipe))}}
                            </span>
                        </div>
                    </div>

                    <div c-if="is_main_recipe(recipe)" class="additional-actions">
                        <i c-on:click="show_groceries = true" class="fa-solid fa-basket-shopping"></i>
                        <i c-on:click="do_edit()" class="fa-regular fa-pen-to-square"></i>
                        <i c-on:click="ask_deletion = true" class="fa-regular fa-trash-can"></i>
                    </div>
                </div>

                <hr>

                <div c-if="recipe.description" style="margin-bottom: 1rem">
                    <h6>Description</h6>
                    {{recipe.description}}
                </div>

                <h6>Ingrédients</h6>
                <ul>
                    <li class="ingredient" c-for="l in recipe.recipe_links">
                        {{$parent.format_ingredient(l, get_count_scale(recipe))}}
                        <a c-on:click="inline_recipe(l)" class="link">{{l.name}}</a>
                        <a c-bind:href="'#/'+l.hash"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    </li>
                    <li class="ingredient" c-for="i in recipe.ingredients">{{$parent.format_ingredient(i, get_count_scale(recipe))}}</li>
                </ul>

                <h6>Étapes</h6>
                <ol class="steps">
                    <li class="step" c-for="s in recipe.steps">{{s.txt}}
                        <div class="help-note" c-for="n in s.notes">
                            {{n.txt}}
                            <a c-if="n.link != null" c-bind:href="n.link">{{n.link}}</a>
                        </div>
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

            <div c-if="show_groceries" c-on:click="show_groceries = false" id="modal">
                <div class="modal-content">
                    <h5 style="margin-top: 20px; margin-bottom: 20px">Liste de courses</h5>
                    <hr>
                    <ul>
                        <li class="ingredient" c-for="ingredient in get_grocery_list()">{{ingredient}}</li>
                    </ul>
                </div>
            </div>
		</div>
	`,
    model: {
        recipes: [],
        recipes_linked: [],
        ask_deletion: false,
        show_groceries: false,
    },

    controller: {
        is_main_recipe: function(recipe) {
            return recipe === this.recipes[this.recipes.length - 1];
        },
        get_count_scale: function(recipe) {
            let main_recipe = this.recipes[this.recipes.length - 1];
            let scale = (main_recipe.count_req/main_recipe.count);
            if (recipe != main_recipe)
                scale *= (recipe.count_req/recipe.count);
            return scale;
        },
        get_grocery_list: function() {
            let list = new Map();
            let main_recipe = this.recipes[this.recipes.length - 1];
            for (let recipe of [main_recipe, this.recipes_linked].flat())
            {
                for (let ingredient of recipe.ingredients)
                {
                    ingredient = this.$parent.convert_to_base_unit(ingredient);
                    if (list.has(ingredient.item))
                    {
                        let item = list.get(ingredient.item);
                        item.count += parseFloat(ingredient.count);
                    }
                    else
                    {
                        list.set(ingredient.item, {count: parseFloat(ingredient.count), unit: ingredient.unit, item: ingredient.item});
                    }
                }
            }
            return [...list.values()].map(x => this.$parent.format_ingredient(x));
        },
        do_edit: function() {
            router.goto("#/edit/" + this.recipes[this.recipes.length-1].hash);
        },
        do_delete: function() {
            this.ask_deletion = false;
            DB.delete_recipe(this.recipes[this.recipes.length-1].hash)
                .then(() => this.$router.goto(this.$router.defaultRoute));
        },
        inline_recipe: function(l) {
            if (this.recipes.find(recipe => recipe.hash == l.hash))
                return;

            let recipes = this.recipes.slice(); // shallow copy
            let to_insert = this.recipes_linked.find(recipe => recipe.hash == l.hash);
            recipes.splice(this.recipes.length - 1, 0, to_insert);
            this.recipes = recipes;
        },
        build_recipe_object: function(recipe) {
            for (let step of recipe.steps)
            {
                for (let i = 0; i < step.notes.length; i++)
                {
                    step.notes[i] = { txt: step.notes[i], link: null };

                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const matches = step.notes[i].txt.match(urlRegex);
                    if (matches != null)
                    {
                        step.notes[i].txt = step.notes[i].txt.replace(matches[0], "");
                        step.notes[i].link = matches[0];
                    }
                }
            }

            for (let link of recipe.recipe_links)
            {
                link.name = "";
                link.unit = "g";
            }

            return {
                name: recipe.name,
                hash: recipe.hash,
                tags: recipe.tags,
                count: recipe.count,
                count_req: recipe.count,
                unit: recipe.unit,
                cooking_time: recipe.cooking_time,
                prep_time: recipe.prep_time,
                recipe_links: recipe.recipe_links,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                description: recipe.description,
            };

        },
        onShow: function() {
            let hash = this.$router.route.substr(2);
            DB.get_recipe(hash).then((recipe) => {

                this.recipes = [this.build_recipe_object(recipe)];

                document.title = recipe.name;

                return DB.get_descriptors();
            })
            .then((descriptors) =>{

                let recipes = [];
                for (let link of this.recipes[0].recipe_links)
                {
                    recipes.push(link.hash);

                    let recipe = descriptors.find(r => r.hash == link.hash);
                    if (recipe != null)
                        link.name = recipe.name;
                }

                if (recipes.length != 0)
                    return DB.get_recipes(recipes);
            })
            .then(recipes => {
                if (recipes == null) return;

                let main_recipe = this.recipes[this.recipes.length - 1];
                this.recipes_linked = recipes.map(recipe => {
                    recipe = this.build_recipe_object(recipe);

                    let recipe_link = main_recipe.recipe_links.find(linked => linked.hash == recipe.hash);
                    recipe.count_req = recipe_link.count;
                    recipe_link.unit = recipe.unit;

                    return recipe;
                });
            })
            .catch((error) => {
                console.error(error);
                // Recipe doesn't exist, redirect home
                this.$router.goto(this.$router.defaultRoute);
            });

        },
        onHide: function() {
            this.recipes = [];
            this.recipes_linked = [];
        }
    }
});

