import {VNode, createTextNode, createEmptyNode, createComponent} from '../vdom/index.js'
import {isObject} from '../utils/index.js'
import {genNode} from "./index.js"


export function getRenderer(ASTRoot)
{
    let generator = genNode(ASTRoot);
    return new Function("with(this){return " + generator + ";}");
}


export function _c(params)
{
    let factory = this.$factories[params.tag];
    
    if (factory)
        return createComponent(factory, this, params.inits);

    else
        return new VNode(params.tag, params.model, params.watched, params.listeners, params.attributes, params.children.flat(), this);
}

export function _e()
{
    return createEmptyNode();
}

export function _t(text)
{
    return createTextNode(text);
}

export function _l(container, generator)
{
    let elems, i, l;

    // range loop
    if (typeof container === 'number')
    {
        elems = new Array(container);

        for (i = 0; i < container; i++)
            elems[i] = generator(i, i)
    }

    // array loop
    else if (Array.isArray(container))
    {
        l = container.length;
        elems = new Array(l);

        for (i = 0; i < l; i++)
            elems[i] = generator(i, container[i], i)
      }

    // object loop
    else if (isObject(container))
    {
        let keys = Object.keys(container);
        l = keys.length;
        elems = new Array(l);

        for (i = 0; i < l; i++)
        {
            let key = keys[i];
            elems[i] = generator(key, container[key], key, i);
        }
    }

    return elems;
}

export function _f(node, alias)
{
    if (node.model != null)
    {
        node.model.aliases = node.model.aliases || [];
        node.model.aliases.push(alias);
    }
    if (node.children)
        Array.prototype.forEach.call(node.children, child => { _f(child, alias); });

    return node;
}
