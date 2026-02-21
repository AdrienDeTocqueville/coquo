import App from './dist/circular.js'
import Router from './dist/router.js'

// STUFF

document.querySelector("#title").addEventListener("click", () => {
    router.goto(router.defaultRoute);
});

document.querySelector("#logout").addEventListener("click", () => {
    DB.logout();
    router.goto("#/signin");
});

// CIRCULAR

export let app = new App({
    selector: "coquo",
    view: "<router> </router>",
    model: {
        TAGS: ["Pâte", "Crème", "Gâteau", "Tarte", "Pâtisserie"],
        TAGS_PLURAL: ["Pâtes", "Crèmes", "Gâteaux", "Tartes", "Pâtisseries"],
        UNITS: ["g", "kg", "mL", "cL", "L", "cm", "personnes"],
    },
    controller: {
        convert_to_base_unit: function(ingredient) {
            if (ingredient.unit == "L")
                return {count: ingredient.count * 1000, unit: "mL", item: ingredient.item};
            if (ingredient.unit == "cL")
                return {count: ingredient.count * 10, unit: "mL", item: ingredient.item};
            if (ingredient.unit == "kg")
                return {count: ingredient.count * 1000, unit: "g", item: ingredient.item};
            return ingredient;
        },
        convert_to_best_unit: function(ingredient, scale = 1) {
            let count = ingredient.count * scale;
            if (ingredient.unit == "mL")
            {
                if (count >= 1000)
                    return {count: count / 1000, unit: "L", item: ingredient.item};
                if (count >= 100)
                    return {count: count / 10, unit: "cL", item: ingredient.item};
            }
            else if (ingredient.unit == "g")
            {
                if (count >= 1000)
                    return {count: count / 1000, unit: "kg", item: ingredient.item};
            }
            return {count, unit: ingredient.unit, item: ingredient.item};
        },
        format_ingredient: function(ingredient, scale = 1) {
            ingredient = this.convert_to_best_unit(ingredient, scale);
            let result = "";
            if (ingredient.count != 0)
                result += `${ingredient.count}${ingredient.unit}`;
            if (ingredient.item)
                result += (result.length != 0 ? ' ' : '') + ingredient.item;
            return result;
        },
    }
});

export let router = new Router({
	app,
	selector: "router",
	defaultRoute: "#/home",
	notFoundRoute: "#/home"
});

DB.register(router);


router.addRoute("#/signin", {
	view: `
		<div>
		    <div id="firebaseui-auth-container"></div>
		</div>
	`,
    model: {
    },
    controller: {
        onShow: function() {
            DB.register_auth_container("#firebaseui-auth-container");
        }
    }
});

app.mount();
