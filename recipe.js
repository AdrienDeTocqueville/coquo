import { app, router } from './main.js'

router.addRoute("#/*", {
	view: `
        <div class="container">
            <div c-if="recipe != null">
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

                        <div class="additional-item" style="margin-left: auto">
                            <input id="count" style="width: 80px" type="number" min="1" c-model="recipe.count_req">
                            <span>{{recipe.unit}}</span>
                        </div>
                    </div>

                    <div class="additional-actions">
                        <i c-on:click="show_groceries = true" class="fa-solid fa-basket-shopping"></i>
                        <i c-on:click="do_edit()" class="fa-regular fa-pen-to-square"></i>
                        <i c-on:click="ask_deletion = true" class="fa-regular fa-trash-can"></i>
                    </div>
                </div>

                <hr>

                <h6>Ingrédients</h6>
                <ul>
                    <li class="ingredient" c-for="l in recipe.recipe_links">{{l.count * (recipe.count_req/recipe.count)}}{{l.unit}} <a c-bind:href="'#/'+l.hash">{{l.name}}</a></li>
                    <li class="ingredient" c-for="i in recipe.ingredients">{{i.count * (recipe.count_req/recipe.count)}}{{i.unit}} {{i.item}}</li>
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
		</div>
	`,
    model: {
        recipe: null,
        ask_deletion: false,
        show_groceries: true,
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
                    count: recipe.count,
                    count_req: recipe.count,
                    unit: recipe.unit,
                    cooking_time: recipe.cooking_time,
                    prep_time: recipe.prep_time,
                    recipe_links: recipe.recipe_links,
                    ingredients: recipe.ingredients,
                    steps: recipe.steps
                };

                for (let step of this.recipe.steps)
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

                for (let link of this.recipe.recipe_links)
                {
                    link.name = "";
                    link.unit = "g";
                }

                document.title = desc.name;

                return DB.load_descriptors();
            })
            .then((descriptors) =>{
                for (let link of this.recipe.recipe_links)
                {
                    let recipe = descriptors.find(r => r.hash == link.hash);
                    if (recipe != null)
                        link.name = recipe.name;
                }
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

