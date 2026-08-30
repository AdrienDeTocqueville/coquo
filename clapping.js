import { app, router } from './main.js'

router.addRoute("#/home", {
	view: `
		<div class="recipe-group recipe-container" style="grid-template-columns: repeat(auto-fit, 400px)">

			<div class="session">
				<h2>Session #1</h2>

				<div class="menu">
					<a>Cheese gougères</a><br>
					<a>Tartare de boeuf</a><br>
					<br>
					<a>Shrimp carpaccio</a><br>
					<a>Vieira a la gallega</a><br>
					<a>Leeks with vinaigrette</a><br>
					<br>
					<a>Sourdough bread</a><br>
					<br>
					<a>Quiche au roquefort</a><br>
					<br>
					<a>Entrecôte, fries</a><br>
					<a>Green sauce from the «Relais de l’Entrecôte»</a><br>
					<br>
					<a link="upAILRNwlG">Lemon meringue pie</a><br>
					<a link="MF0Mdtoi0h">Flan parisien</a><br>
					<br>
					<a link="KukIuOLiTM">Macaron</a><br>
					<a>Tarta de Santiago</a><br>
				</div>
			</div>

			<div class="session">
				<h2>Session #2</h2>

				<div class="menu">

					<h5>Snacks</h5>
					<a>Foie a la Plancha PX</a><br>
					<a>Flor de calabacín</a><br>
					<a>Huevos con Trompetas</a><br>
					<br>

					<h5>Tapas</h5>
					<a>Pa amb tomàquet</a><br>
					<a>Embutidos</a><br>
					<a>Bravas del Tomás</a><br>
					<a>Pimientos de Padrón</a><br>
					<a>Dúo de Gazpachos</a><br>
					<a>Tortilla casi Española</a><br>
					<br>

					<h5>Principal</h5>
					<a>Cerdo Ibérico</a><br>
					<a>Chulles de Corder</a><br>
					<a>Croqueta de rabo de toro, colmenillas</a><br>
					<br>

					<h5>Dulce</h5>
					<a link="rxwJjTKzLv">Torrijas con helado de Horchata</a><br>
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
			}
		}
	},
});

