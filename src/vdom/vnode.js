import { defProp, unpack } from "../utils/index.js";

export class VNode
{
    constructor(tagName, model, watched, listeners, attributes, children, component)
    {
        this.tagName = tagName;

        if (model) this.model = model;
        if (watched) this.watched = watched;
        if (listeners) this.listeners = listeners;
        if (attributes) this.attributes = attributes;

        if (children) this.children = children;

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
            this.component = this.factory.create(this.parent);
            this.el = this.component.$vroot.el;

            let initializer = new Function("with(this){ " + this.inits + ";}");
            initializer.bind(this.component)();

            this.component._show();
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

    setModel(old_node)
    {
        if (this.model)
        {
            let input = this.el;
            let params = unpack(this.component, this.model.var, this.model.aliases);
            let p = Object.getOwnPropertyDescriptor(params.obj, params.key);

            this.model.target = params.obj;

            let is_valid = (old_node &&
                old_node.model.target === this.model.target &&
                old_node.model.on == this.model.on);

            if (is_valid)
            {
                this.model.listener = old_node.model.listener;
                this.model.old_props = old_node.model.old_props;
            }
            else
            {
                if (old_node)
                {
                    input.removeEventListener(old_node.model.on, old_node.model.listener);
                    if (old_node.model.old_props.getter && old_node.model.old_props.setter)
                    {
                        Object.defineProperty(old_node.model.target, params.key, {
                            enumerable: true,
                            configurable: true,

                            get: old_node.model.old_props.getter,
                            set: old_node.model.old_props.eetter,
                        });
                    }
                    else
                    {
                        Object.defineProperty(old_node.model.target, params.key, {
                            enumerable: true,
                            configurable: true,
                            writable: true,
                            value: old_node.model.target[params.key]
                        });
                    }
                }

                const property = Object.getOwnPropertyDescriptor(params.obj, params.key);
                if (property.configurable)
                {
                    let getter = property.get;
                    let setter = property.set;
                    if (!getter || !setter)
                        var val = params.obj[params.key];

                    let new_get = getter || function() { return val; };
                    let new_set = function reactiveSet(newVal) {
                        if (setter)
                            setter(newVal);
                        else
                            val = newVal;

                        input.value = newVal;
                    }

                    Object.defineProperty(params.obj, params.key, {
                        enumerable: true,
                        configurable: true,

                        get: new_get,
                        set: new_set,
                    });

                    this.model.old_props = { getter, setter };
                    this.model.listener = function(e) {
                        if (setter)
                            setter(this.value);
                        else
                            val = this.value;
                    };

                    input.addEventListener(this.model.on, this.model.listener);
                    input.value = new_get(); // initialize view
                }

            }
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

export function createComponent(factory, parent, inits)
{
    let vnode = new VNode(undefined, undefined, undefined);
    vnode.factory = factory;
    vnode.parent = parent;
    vnode.inits = inits;

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
