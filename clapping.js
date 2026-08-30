import { app, router } from './main.js'

router.addRoute("#/home", {
	view: `
		<div class="recipe-group recipe-container" style="grid-template-columns: repeat(auto-fit, 400px)">

			<div class="session">
				<h2>Session #1</h2>

				<div class="menu">
					<a link="cTLTVZsrMw">Cheese gougères</a><br>
					<a link="BdVENiwEyJ">Tartare de boeuf</a><br>
					<br>
					<a link="3gpsVY6i2E">Shrimp carpaccio</a><br>
					<a link="gNSEOO6fOI">Vieira a la gallega</a><br>
					<a link="A4n6I4Az4P">Leeks with vinaigrette</a><br>
					<br>
					<a link="pICzUnXzPS">Sourdough bread</a><br>
					<br>
					<a link="WvhFLY9D0E">Quiche au roquefort</a><br>
					<br>
					<a link="cBmFqaVm5s">Entrecôte, fries</a><br>
					<a link="J6BsUzPC6I">Green sauce from the «Relais de l’Entrecôte»</a><br>
					<br>
					<a link="upAILRNwlG">Lemon meringue pie</a><br>
					<a link="MF0Mdtoi0h">Flan parisien</a><br>
					<br>
					<a link="KukIuOLiTM">Macaron</a><br>
					<a link="9wM5StbBMK">Tarta de Santiago</a><br>
				</div>
			</div>

			<div class="session">
				<h2>Session #2</h2>

				<div class="menu">

					<h5>Snacks</h5>
					<a link="Fn54LwvEN5">Foie a la Plancha PX</a><br>
					<a link="0WrV8ENLW0">Flor de calabacín</a><br>
					<a link="2iaOv96fA1">Huevos con Trompetas</a><br>
					<br>

					<h5>Tapas</h5>
					<a link="rKtxV8qvvO">Pa amb tomàquet</a><br>
					<a link="iER7HuKU85">Embutidos</a><br>
					<a link="4TRK6SupSl">Bravas del Tomás</a><br>
					<a link="61bjc4uarP">Pimientos de Padrón</a><br>
					<a link="CdsNtSmKAU">Dúo de Gazpachos</a><br>
					<a link="FcciJhvgfB">Tortilla casi Española</a><br>
					<br>

					<h5>Principal</h5>
					<a link="G2MueLRFMz">Cerdo Ibérico</a><br>
					<a link="QDgeoRGotn">Chulles de Corder</a><br>
					<a link="kwTd0lHKrF">Croqueta de rabo de toro, colmenillas</a><br>
					<br>

					<h5>Dulce</h5>
					<a link="rxwJjTKzLv">Torrijas</a><br>
					<a link="yHDmKWUtaS">Helado de Horchata</a><br>
					<a link="Ma1cXd9FWp">Mousse de chocolate con AOVE y sal</a><br>
					<br>

					<h5>Petit Fours</h5>
					<a link="LnA1T2GpNe">Cannelés</a><br>
				</div>
			</div>
		</div>
	`,
    model: {
		SESSIONS: [{
			date: "27 novembre 2025"
		},{
			date: "29 de agosto de 2026"
		}]
    },
    controller: {
		onShow: function() {
			let recipes = document.querySelectorAll(".menu a");
			for (let i = 0; i < recipes.length; i++)
			{
				let attr = recipes[i].getAttribute("link");
				if (attr)
				{
					recipes[i].href = "#/" + attr;
				}
				/*
				else
				{
					let recipe = {};
					recipe.name = recipes[i].innerText;
					recipe.tags = ["Clapping"];
					recipe.cooking_time = "0min";
					recipe.prep_time = "0min";
					recipe.count = "1";
					recipe.unit = "personnes";
					recipe.recipe_links = [];
					recipe.ingredients = [{count: 0, unit:'', item: "TODO"}];
					recipe.steps = [{txt: "TODO", notes: []}];
					recipe.description = null;

					let hash = this.$parent.gen_hash(10);
					console.log(recipe.name)
					console.log(hash);

					let desc = {
						name: recipe.name,
						tags: recipe.tags
					};

					DB.set_recipe(hash, desc, recipe);
				}
				*/
			}
		}
	},
});

