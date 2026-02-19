export function domFromString(string)
{
    let el = document.createElement('div');
    el.innerHTML = string;

    if (el.children.length != 1)
        console.error("circular: View should contain exactly one root element");

    return el.firstElementChild;
}


/**
 *
 * @param {DOMElement} element
 */
export function parseDOM(element)
{
    let ASTElem = createASTElement(element.tagName, element.attributes);

    Array.prototype.forEach.call(element.childNodes, child => {
        if (child.nodeType === 1) {
            ASTElem.children.push(parseDOM(child));
        } else if (child.nodeType === 3) {
            if (child.data.trim() != "") {
                ASTElem.children.push({
                    type: 3,
                    text: child.data
                });
            }

        }
    });

    return ASTElem;
}


/**
 *
 * @param {string} tag
 * @param {array} attribs
 */
function createASTElement(tag, attribs)
{
    let element = {
        tag,
        type: 1,
        attribs: {},
        children: [],

        watching: [],
        bindings: [],
        inits: [],
        on: {},
    }

    for (let attrib of attribs)
    {
        if (attrib.name.search(/^c-/) != -1)
            processDirective(element, attrib);

        else
            element.attribs[attrib.name] = attrib.value;
    }

    return element;
}

function processDirective(element, directive)
{
    let dir = directive.name.substring(2).split(/:/);
    let directiveName = dir[0],
        directiveArg = dir[1];

    const parsers = {
        "model": parseModel,
        "watch": parseWatch,
        "bind": parseBind,
        "init": parseInit,
        "for": parseFor,
        "on": parseOn,
        "if": parseIf
    }

    let parser = parsers[directiveName];

    if (parser)
        parser(element, directiveArg, directive.value);

    else
        console.error("circular: Unknown directive", directiveName);
}

function parseModel(el, arg, val)
{
    el.model = {
        on: arg || 'keyup',
        var: val
    };
}

function parseWatch(el, arg, val)
{
    el.watching.push(val);
}

function parseBind(el, arg, val)
{
    el.bindings.push({arg, val});
}

function parseInit(el, arg, val)
{
    el.inits.push({arg, val})
}

function parseFor(el, arg, val)
{
    let reg = /([^]*?)\s+(?:in|of)\s+([^]*)/;
    let matches = val.match(reg);

    el.for = matches[2].trim();
    el.alias = matches[1].trim();
}

function parseOn(el, arg, val)
{
    el.on[arg] = val;
}

function parseIf(el, arg, val)
{
    el.if = val;
}
