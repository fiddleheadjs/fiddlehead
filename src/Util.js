export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const slice = Array.prototype.slice;

export const isString = (value) => {
    return typeof value === 'string'/* || value instanceof String*/;
}

export const isNumber = (value) => {
    return typeof value === 'number'/* || value instanceof Number*/;
}

export const isFunction = (value) => {
    return typeof value === 'function';
}

export const isArray = (value) => {
    return value instanceof Array;
}

export const isObject = (value) => {
    return value !== null && typeof value === 'object';
}

export const isNullish = (value) => {
    return value === null || value === undefined;
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
export const compareArrays = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
