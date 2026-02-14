import {ComponentFactory} from '../component/index.js';


export default class App
{
    constructor(params)
    {
        params = params || {};

        this.selector = params.selector;
        this.root = params;
    }

    mount(selector)
    {
        if (this.isMounted)
            return;

        this.selector = selector || this.selector || "app";
        this.node = document.querySelector(this.selector);

        if (!this.root.view)
            this.root.view = this.node.outerHTML;

        this.root = (new ComponentFactory(this.root)).create();
        this.root._show(this.node);
        
        this.node = this.root.$vroot.el;

        this.isMounted = true;
    }
}
