/**
 * 
 * @param {object} dest 
 * @param {object} src
 */
export function extend(dest, src) {
    for (let key in src) {
        dest[key] = src[key];
    }
    return dest
}

/**
 * 
 * @param {object} obj  
 * 
 * @returns {boolean}
 * 
 * Checks wether param is an object 
 */
export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}

/**
 * 
 * @param {object} obj  
 * 
 * @returns {boolean}
 * 
 * Checks wether param is a function 
 */
export function isFunction(obj) {
    return obj instanceof Function;
}

/**
 * 
 * @param {object} obj
 * @param {key} key
 * @param {function} callback
 * 
 * Define get and set properties recursively on all children of obj[key]
 */
export function makeReactive(obj, key, callback)
{
    if (isObject(obj[key]))
    {
        for (var childKey in obj[key])
            makeReactive(obj[key], childKey, callback);
    }
    
    defProp(obj, key, callback);
}

/**
 * 
 * @param {object} obj
 * @param {key} key
 * @param {function} callback
 * @param {boolean} recursive
 * 
 * Defines get and set on o[k]
 */
export function defProp(obj, key, callback, recursive = true)
{
    let params = unpack(obj, key);

    const property = Object.getOwnPropertyDescriptor(params.obj, params.key);
    if (property.configurable === false)
      return;
  
    const getter = property.get;
    const setter = property.set;
    if (!getter || !setter)
        var val = obj[key];

    Object.defineProperty(params.obj, params.key, {
        enumerable: true,
        configurable: true,

        get: function reactiveGet() {
            return getter ? getter.call(obj): val;
        },
        
        set: function reactiveSet(newVal) {
            if (setter)
                setter.call(obj, newVal);
            else
                val = newVal;

            if (recursive && isObject(newVal))
            {
                for (var childKey in newVal)
                    makeReactive(newVal, childKey, callback);
            }

            callback();
        }
    });
}

/**
 * 
 * @param {object} obj
 * @param {key} key
 * 
 * Recursively parse obj if key references child property
 */
export function unpack(obj, key, aliases)
{
    const keys = key.split('.');

    if (keys.length > 1)
    {
        key = keys.slice(1).join('.');

        if (aliases != null)
        {
            for (let alias of aliases)
            {
                if (alias.names.indexOf(keys[0]) != -1)
                {
                    return unpack(alias.container[alias.value], key);
                }
            }
        }

        return unpack(obj[keys[0]], key);
    }

    return {obj, key};
}
