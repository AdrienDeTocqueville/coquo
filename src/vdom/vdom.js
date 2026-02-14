/**
 * @description for rendering, root element should be added to component's element
 */

export default function updateDOM(nvnode, ovnode, parent)
{
    if (!ovnode) {
        nvnode.createElement();
        if (parent)
            parent.el.appendChild(nvnode.el);
    }
    else if (!nvnode) {
        ovnode.el.remove();
    }
    else if (haschanged(nvnode, ovnode)) {
        nvnode.createElement();
        ovnode.el.parentElement.replaceChild(nvnode.el, ovnode.el)
    }
    else {
        nvnode.el = ovnode.el;

        if (nvnode.children)
        {
            const nl = nvnode.children.length
            const ol = ovnode.children.length
            for (let i = 0; i < nl || i < ol; i++) {
                updateDOM(nvnode.children[i], ovnode.children[i], ovnode)
            }
        }
    }
}

/**
 * @description return true if node changed
 * @param {*} node1 
 * @param {*} node2 
 */
function haschanged(node1, node2) {
    let test = (node1.tagName !== node2.tagName)
            || (node1.factory !== node2.factory)
            || (node1.isEmpty !== node2.isEmpty)
            || (node1.text !== node2.text)
            || (JSON.stringify(node1.attributes) !== JSON.stringify(node2.attributes));

    return test;
}