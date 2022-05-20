export const hasOwnProperty = (obj, propName) => {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}

export const isString = (value) => {
    return typeof value === 'string' || value instanceof String;
}

export const isNumber = (value) => {
    return typeof value === 'number' || value instanceof Number;
}

export const isFunction = (value) => {
    return value instanceof Function;
}

export const isArray = (value) => {
    return value instanceof Array;
}

export const isObject = (value) => {
    return value !== null && typeof value === 'object';
}

export const isEmpty = (value) => {
    return value === undefined || value === null;
}

/**
 * 
 * @param {Array|string} full 
 * @param {Array|string} sub 
 * @returns {boolean}
 */
export const startsWith = (full, sub) => {
    if (full.length < sub.length) {
        return false;
    }

    for (let i = sub.length - 1; i >= 0; --i) {
        if (sub[i] !== full[i]) {
            return false;
        }
    }

    return true;
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
export const compareSameLengthArrays = (a, b) => {
    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
