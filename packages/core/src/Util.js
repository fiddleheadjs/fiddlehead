export let hasOwnProperty = Object.prototype.hasOwnProperty;

export let slice = Array.prototype.slice;

export let isString = (value) => {
    return typeof value === 'string'/* || value instanceof String*/;
};

export let isNumber = (value) => {
    return typeof value === 'number'/* || value instanceof Number*/;
};

export let isFunction = (value) => {
    return typeof value === 'function';
};

export let isArray = (value) => {
    return value instanceof Array;
};

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
export let compareArrays = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};
