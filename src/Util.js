export function hasOwnProperty(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}

export function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

export function isFunction(value) {
    return value instanceof Function;
}

export function isArray(value) {
    return value instanceof Array;
}

export function isObject(value) {
    return value !== null && typeof value === 'object';
}

export function isEmpty(value) {
    return value === undefined || value === null;
}

/**
 * 
 * @param {Array|string} full 
 * @param {Array|string} sub 
 * @returns {boolean}
 */
export function startsWith(full, sub) {
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
export function compareSameLengthArrays(a, b) {
    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
