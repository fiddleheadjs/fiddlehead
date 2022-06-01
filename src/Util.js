export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const slice = Array.prototype.slice;

export function isString(value) {
    return typeof value === 'string'/* || value instanceof String*/;
}

export function isNumber(value) {
    return typeof value === 'number'/* || value instanceof Number*/;
}

export function isFunction(value) {
    return typeof value === 'function';
}

export function isArray(value) {
    return value instanceof Array;
}

export function isObject(value) {
    return value !== null && typeof value === 'object';
}

export function isNullish(value) {
    return value === null || value === undefined;
}

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
export function compareArrays(a, b) {
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
