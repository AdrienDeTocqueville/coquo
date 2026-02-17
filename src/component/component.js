import {updateDOM} from '../vdom/index.js'
import {_c, _e, _t, _l, _f} from '../renderer/index.js'
import {makeReactive, extend} from '../utils/index.js';


export default class Component
{
    // Init
    constructor(stylesheets, model, renderer, controller, factories, parent)
    {
        this.$stylesheets = stylesheets;

        this.$factories = factories;
        this.$parent = parent;

        this.$updater = null;
        this.$delay = 0;

        this.$render = renderer;
        this._c = _c;
        this._e = _e;
        this._t = _t;
        this._l = _l;
        this._f = _f;
        

        extend(this, model);
        extend(this,  controller);

        this.onLoad && this.onLoad();

        this._proxify(model);
        this.__update();
    }

    _proxify(model)
    {
        for (var prop in model)
            makeReactive(this, prop, this._update.bind(this));
    }

    // Display
    _show(node)
    {
        this._applyStyle();

        if (node && node.parentNode)
            node.parentNode.replaceChild(this.$vroot.el, node);

        this.onShow && this.onShow();
    }

    _hide(node)
    {
        if (node && this.$vroot.el.parentNode)
            this.$vroot.el.parentNode.replaceChild(node, this.$vroot.el);
            
        this._removeStyle();

        this.onHide && this.onHide();
    }

    _applyStyle()
    {
        for (let stylesheet of this.$stylesheets)
            document.head.appendChild(stylesheet);
    }

    _removeStyle()
    {
        for (let stylesheet of this.$stylesheets)
            document.head.removeChild(stylesheet);
    }


    _update()
    {
        if (!this.$updater)
		    this.$updater = setTimeout(this.__update.bind(this), this.$delay);
    }

    __update()
    {
        this.$updater = null;

        try
        {
            let nvroot = this.$render();
            updateDOM(nvroot, this.$vroot);
            this.$vroot = nvroot;
        }
        catch (e)
        {
            console.error("circular: ", e);
        }
    }
}
