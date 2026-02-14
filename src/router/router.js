import {Component, ComponentFactory} from '../component/index.js'

export default class Router
{
	constructor(params)
	{
		if (!params.app)
			console.error("router: app must be sent as parameter");

		this.app = params.app;
		this.selector = params.selector || "router";
		
		this.defaultRoute = params.defaultRoute || "";
		this.notFoundRoute = params.notFoundRoute || "";

		this.routes = [];
		this.route = window.location.hash;
		this.currentComponent = undefined;


		Component.prototype.$router = this;
		
		this.onHashChange = this.onHashChange.bind(this);

		window.addEventListener('hashchange', this.onHashChange);
		window.addEventListener('DOMContentLoaded', this.onHashChange);
	}

	addRoute(route, component)
	{
	    this.routes.push(
	    {
			url: new RegExp(route, 'gi'),
			factory: new ComponentFactory(component),
			component: null
		});
	}

	onHashChange()
	{
		if (!this.node && this.app.isMounted)
			this.node = document.querySelector(this.selector);

		this.route = window.location.hash || this.defaultRoute;

		let match = this.routes.filter(route => this.route.match(route.url))[0];

		if (match)
		{
			this.params = match.url.exec(this.route);
			this.show(match);
		}
		else
		{
			match = this.routes.filter(route => this.notFoundRoute.match(route.url))[0];
			match && this.show(match);
		}
	}

	show(route)
	{
		if (!route.component)
			route.component = route.factory.create(this.app.root);

		if (this.currentComponent)
		{
			this.currentComponent._hide(this.node);
			this.currentComponent = null;
		}

		route.component._show(this.node);
		this.currentComponent = route.component;
	}

	goto(route)
	{
		window.location.hash = route;
	}

	back()
	{
		history.back();
	}

	forward()
	{
		history.forward();
	}
}