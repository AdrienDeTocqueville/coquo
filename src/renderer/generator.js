import {defProp} from '../utils/index.js';

export default function genNode(node)
{
    if (node.type == 1)
        return genElement(node);

    else if (node.type == 3)
        return genTextNode(node);

    else
        throw new Error("Element type not supported (yet?)");
}

function genElement(elem)
{
    let tag = genTag(elem);

    let model = genModel(elem);
    let watched = genWatched(elem);
    let listeners = genListeners(elem);
    let attributes = genAttributes(elem);

    let children = genChildren(elem);

    let generator = `_c({${tag}${model}${watched}${listeners}${attributes}${children}})`;

    if (elem.if)
    {
        generator = `(${elem.if})?${generator}:_e()`;
    }

    if (elem.for)
    {
        generator = `_l(${elem.for},` +
                    `function(${elem.alias})` +
                    `{return ${generator};})`;
    }

    return generator;
}

function genTextNode(elem)
{
    let text = elem.text.replace(/[\n\r]/g, "");
    text = text.replace("'", "\\'").replace('"', '\\"').replace('`', '\\`');
    text = text.replace(/{{/g, "'+String(").replace(/}}/g, ")+'") || null;

    return `_t('${text}')`;
}


function genTag(elem)
{
    return `tag: '${ elem.tag }'`;
}

function genModel(elem)
{
    return elem.model ? `,model:{on:'${elem.model.on}',var:'${elem.model.var}',f:function(){${elem.model.var}=this.value}}` : ``;
}

function genWatched(elem)
{
    return elem.watching.length? `,watched:['${ elem.watching.join(',') }']`: '';
}

function genListeners(elem)
{
    let listeners = Object.keys(elem.on).map( event => `'${event}':function($e) {${elem.on[event]};}` );

    return listeners.length? `,listeners:{${ listeners.join(',') }}`: '';
}

function genAttributes(elem)
{
    let attribs = Object.keys(elem.attribs).map( attrib => `'${attrib}':'${elem.attribs[attrib]}'` );
    let bindings = elem.bindings.map( binding => `'${binding.arg}':${binding.val}` );

    let attributes = attribs.concat(bindings);

    return attributes.length? `,attributes:{${ attributes.join(',') }}`: '';
}

function genChildren(elem)
{
    return `,children:[${ elem.children.map( child => genNode(child) ).join(',') }]`;
}