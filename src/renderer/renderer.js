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
        return new VNode(params.tag, params.model, params.watched, params.listeners, params.attributes, [].concat.apply([], params.children), this);
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
            elems[i] = generator(i)
    }

    // array loop
    else if (Array.isArray(container))
    {
        l = container.length;
        elems = new Array(l);

        for (i = 0; i < l; i++)
            elems[i] = generator(container[i], i)
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
            elems[i] = generator(container[key], key, i);
        }
    }

    return elems;
}