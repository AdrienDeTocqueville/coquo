import { defProp, unpack } from "../utils/index.js";

export class VNode
{
    constructor(tagName, model, watched, listeners, attributes, children, component)
    {
        this.tagName = tagName;

        this.model = model;
        this.watched = watched;
        this.listeners = listeners;
        this.attributes = attributes;

        this.children = children;
        
        this.component = component;
        this.el = undefined;
    }

    createElement()
    {
		if (this.text || this.text === '') {
            this.el = document.createTextNode(this.text);
        }
        else if (this.isEmpty) {
            this.el = document.createComment("c-if node");
        }
        else if (this.factory) {
            let c = this.factory.create(this.parent);
            this.el = c.$vroot.el;
            
            c._show();
        }
        else {
            this.el = document.createElement(this.tagName);
          
            this.setModel();
            this.setWatchers();
            this.setListeners();
            this.setAttributes();
            
            this.children.forEach(child => {
                child.createElement();
                this.el.appendChild(child.el);
            });
        }
    }

    setModel()
    {
        if (this.model)
        {
            let input = this.el;
            let params = unpack(this.component, this.model.var);
            let p = Object.getOwnPropertyDescriptor(params.obj, params.key);

            this.el.addEventListener(this.model.on, function(){params.obj[params.key] = this.value}); // NOTE: creates view - model - view update
            defProp(this.component, this.model.var, function(){input.value=params.obj[params.key]}, false);

            input.value = p.get(); // initialize view
        }
    }
    
    setWatchers()
    {
        if (this.watched)
        {
            let component = this.component;
            for (let prop of this.watched)
                defProp(this.component, prop, function(){component._update()}, false);
        }
    }
    
    setListeners()
    {
        for (let event in this.listeners)
            this.el.addEventListener(event, this.listeners[event]);
    }

    setAttributes()
    {
        for (let attribute in this.attributes)
            this.el.setAttribute(attribute, this.attributes[attribute]);
    }
}

export function createComponent(factory, parent)
{
    let vnode = new VNode(undefined, undefined, undefined);
    vnode.factory = factory;
    vnode.parent = parent;

    return vnode;
}

export function createEmptyNode()
{
    let vnode = new VNode(undefined, undefined, undefined);
    vnode.isEmpty = true;

    return vnode;
}

export function createTextNode(text)
{
    let vnode = new VNode(undefined, undefined, undefined);
    vnode.text = text;

    return vnode;
}