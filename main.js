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
        TAGS: ["Tarte", "Patisserie", "Gateau", "Pâte"],
        UNITS: ["g", "kg", "mL", "L", "personnes"],
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
            let signIn = document.querySelector("#firebaseui-auth-container");
            DB.ui.start('#firebaseui-auth-container', uiConfig);
        }
    }
});

app.mount();
