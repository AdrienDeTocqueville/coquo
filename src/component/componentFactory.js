import {Component} from "./index.js";

import {getRenderer} from "../renderer/index.js";
import {domFromString, parseDOM} from '../parser/index.js'
import {isFunction, isObject} from "../utils/index.js";


export default class ComponentFactory
{
    constructor(params)
    {
        this.stylesheets = [];
    
        this.model = params.model || {};
        this.render = params.view;
        this.controller = params.controller || {};

        this.factories = {};
        

        if (params.stylesheets)
        {
            for (var file of params.stylesheets)
                this.stylesheets.push(this.createStyleheetElement(file));
        }
        
        if (params.components)
        {
            for (var tag in params.components)
                this.factories[tag.toUpperCase()] = new ComponentFactory(params.components[tag]);
        }
    }

    create(parent)
    {
        let model = JSON.parse(JSON.stringify(this.model)); // deep copy
        let comp = new Component(this.stylesheets, model, this.getRenderer(), this.controller, this.factories, parent);
        
        return comp;
    }

    createStyleheetElement(file)
    {
        var el = document.createElement("link");
            el.setAttribute("rel", "stylesheet");
            el.setAttribute("type", "text/css");
            el.setAttribute("href", file);

        return el;
    }

    getRenderer()
    {
        if (!isFunction(this.render)) // template has not been rendered yet
        {
            if (isObject(this.render))
            {
                if (this.render.url)
                    var template = ""; // TODO: download file
                
                else if (this.render.html)
                    var template = this.render.html;
            }
            else
                var template = this.render;


            let dom = domFromString(template);
            let ast = parseDOM(dom);
            this.render = getRenderer(ast);
        }

        return this.render;
    }
}