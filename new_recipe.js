import { app, router } from './main.js'

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
                <img src="./img/preparation.svg" class="icon">
                <input id="prep" type="text" placeholder="Temps de preparation" min="1" c-model="prep_time" required>

                <img src="./img/cuisson.svg" class="icon">
                <input id="cook" type="text" placeholder="Temps de cuisson" min="1" c-model="cooking_time" required>
            </div>


            <!-- Tags -->
            <div class="form-group" style="display: flex; gap: 25px">
                <button class="btn tag-list dropdown-toggle" type="button" id="tags-dropdown" data-bs-toggle="dropdown" aria-expanded="false">{{get_tags_preview()}}</button>
                <ul class="dropdown-menu" aria-labelledby="tags-dropdown">
                    <li c-for="tag in $parent.TAGS" c-on:click="toggle_tag(tag)" class="dropdown-item">
                        <input class="form-check-input" type="checkbox" c-if="has_tag(tag)" checked>
                        <input class="form-check-input" type="checkbox" c-if="!has_tag(tag)">
                        {{tag}}
                    </li>
                </ul>

                <input id="count" type="number" placeholder="Quantité" min="1" c-model="count" required>

                <button class="btn tag-list dropdown-toggle" type="button" id="unit-dropdown" data-bs-toggle="dropdown" aria-expanded="false">{{unit}}</button>
                <ul class="dropdown-menu" aria-labelledby="unit-dropdown">
                    <li c-for="u in $parent.UNITS" c-on:click="unit = u" class="dropdown-item">{{u}}</li>
                </ul>
            </div>


            <!-- Ingredients -->
            <div class="form-group" style="position: relative">
                <h2>Ingrédients</h2>

                <i c-on:click="add_recipe_link()" class="add-group fa-regular fa-square-plus"></i>

                <div class="ingredient-list">
                    <div c-for="link in recipe_links" class="recipe-link">

                        <input c-model="link.count" style="width: 150px" type="number" placeholder="Quantité" min="1" required>

                        <div style="position: relative; width: 100%">
                            <input c-model="link.name" c-on:input="handle_link(link)" class="link-hash" type="text" placeholder="Recette..." required>
                            <ul class="suggestions"></ul>
                        </div>

                        <i style="cursor: pointer" c-on:click="delete_link(link);" class="fa-regular fa-trash-can"></i>
                    </div>

                    <textarea c-model="ingredients" id="ingredients" placeholder="List each ingredient on a new line" rows="6" required></textarea>
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
        name: "", tags: [],
        cooking_time: "", prep_time: "",
        count: "", unit: "personnes",
        recipe_links: [],
        ingredients: "",
        steps: "",
        filtering: false,
        submit_text: "",
        current_hash: null,
        submit_event: null,
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
        get_tags_preview: function() {
            if (this.tags.length == 0) return "Aucun tag";
            return this.tags.join(", ");
        },
        has_tag: function(tag) {
            return this.tags.indexOf(tag) != -1;
        },
        toggle_tag: function(tag) {
            let tags = this.tags.slice();
            let idx = tags.indexOf(tag);
            if (idx == -1)
                tags.push(tag);
            else
                tags.splice(idx, 1);
            this.tags = tags;
        },
        add_recipe_link: function() {
            let links = this.recipe_links.slice(); // shallow copy
            links.push({count: 1, hash: ""});
            this.recipe_links = links;
        },
        delete_link: function(link) {
            let links = this.recipe_links.slice(); // shallow copy
            links.splice(this.find_link(link), 1);
            this.recipe_links = links;
        },
        normalize_string: function(str) {
            // Removes accents
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        },
        handle_link: function(link) {
            if (this.filtering) return;
            this.filtering = true;

            const input = document.activeElement;
            const suggestions = input.nextSibling;

            const value = this.normalize_string(input.value);
            suggestions.innerHTML = "";

            if (!value) {
                suggestions.style.display = "none";
                this.filtering = false;
                return;
            }

            DB.get_descriptors().then((descriptors) => {

                const filtered = descriptors.filter(item => this.normalize_string(item.name).includes(value));

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
                        this.recipe_links[idx].hash = item.hash;
                    });

                    suggestions.appendChild(li);
                });

                suggestions.style.display = "block";
                this.filtering = false;
            });

        },

        gen_hash: function(length) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                result += chars[randomIndex];
            }

            return result;
        },
        submit_form: function() {

            let hash = this.current_hash != null ? this.current_hash : this.gen_hash(10); // Hope it doesn't collide

            let desc = {
                name: this.name,
                tags: this.tags
            };

            const recipe_links = this.recipe_links.map(({ name, ...rest }) => rest);
            let parsed_steps = this.parse_steps();

            let recipe = {
                count: this.count,
                unit: this.unit,
                cooking_time: this.cooking_time,
                prep_time: this.prep_time,
                recipe_links: recipe_links,
                ingredients: this.parse_ingredients(),
                steps: parsed_steps.steps,
                description: parsed_steps.description,
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
                if (lines[i].trim().length == 0)
                    continue;

                let lead = this.extract_leading_number(lines[i]);
                if (lead == null)
                {
                    result.push({ count: 0, unit: "", item: lines[i] });
                    continue;
                }

                let unit = "";
                let item = lead.rest;
                const spaceIndex = lead.rest.indexOf(" ");
                if (spaceIndex != -1)
                {
                    let name = lead.rest.slice(0, spaceIndex);
                    let unitIndex = this.$parent.UNITS.findIndex(u => u.toLowerCase() == name.toLowerCase());
                    if (unitIndex != -1)
                    {
                        unit = this.$parent.UNITS[unitIndex];
                        item = lead.rest.substr(spaceIndex).trim();
                    }
                }

                result.push({ count: lead.count, unit: unit, item: item });
            }
            return result;
        },

        unparse_ingredients: function(ingredients) {
            let result = "";
            for (let ingredient of ingredients)
                result += this.$parent.format_ingredient(ingredient) + "\n";
            return result;

        },

        parse_steps: function() {
            let lines = this.steps.split("\n\n");
            lines = lines.filter((line) => line.trim().length != 0);

            let description = null;
            let steps = [];
            for (let i = 0; i < lines.length; i++)
            {
                if (lines[i].trim().length == 0)
                    continue;

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

                let txt = lines[i].trim();
                if (txt.length == 0)
                {
                    if (steps.length == 0)
                        description = notes.join("\n");
                    else
                    {
                        let prev_step = steps[steps.length - 1];
                        prev_step.notes.push.apply(prev_step.notes, notes);
                    }
                }
                else
                    steps.push({ txt: lines[i].trim(), notes });
            }

            return { description, steps };
        },

        unparse_steps: function(steps, description) {
            let result = "";
            if (description)
                result += "--\n" + description + "\n--\n\n";

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

            // Clear data
            this.name = "";
            this.tags = [];
            this.cooking_time = "";
            this.prep_time = "";
            this.count = "";
            this.unit = "personnes";
            this.recipe_links = [];
            this.ingredients = "";
            this.steps = "";
            this.submit_text = "Enregistrer la recette";
            this.current_hash = null;
            document.title = "Nouvelle Recette";

            if (this.submit_event == null)
            {
                this.submit_event = function(event) {
                    event.preventDefault(); // Prevent page reload
                    this.submit_form();
                }.bind(this);
                const form = document.querySelector('.recipe-form');
                form.addEventListener('submit', this.submit_event);
            }

            if (router.params.length == 3 && router.params[1].startsWith("edit/"))
            {
                let hash = router.params[2];
                DB.get_recipe(hash).then((recipe) => {

                    for (let i = 0; i < recipe.recipe_links.length; i++)
                        recipe.recipe_links[i].name = "";

                    this.name = recipe.name;
                    this.tags = recipe.tags.filter(tag => this.$parent.TAGS.indexOf(tag) != -1);
                    this.cooking_time = recipe.cooking_time;
                    this.prep_time = recipe.prep_time;
                    this.count = recipe.count;
                    this.unit = recipe.unit;
                    this.recipe_links = recipe.recipe_links;
                    this.ingredients = this.unparse_ingredients(recipe.ingredients);
                    this.steps = this.unparse_steps(recipe.steps, recipe.description);
                    this.submit_text = "Sauvegarder les modifications";
                    this.current_hash = hash;
                    document.title = "Modifier la Recette";

                    return DB.get_descriptors();
                })
                .then((descriptors) => {
                    for (let i = 0; i < this.recipe_links.length; i++)
                    {
                        let recipe = descriptors.find(r => r.hash == this.recipe_links[i].hash);
                        if (recipe != null)
                            this.recipe_links[i].name = recipe.name;
                    }
                });
            }
        }
    }
});
