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
 * @param {Array} A
 * @param {Array} B 
 * @returns {boolean}
 */
export let arraysShallowEqual = (A, B) => {
    if (A === B) {
        return true;
    }
    if (A.length !== B.length) {
        return false;
    }
    for (let i = A.length - 1; i >= 0; --i) {
        if (!Object.is(A[i], B[i])) {
            return false;
        }
    }
    return true;
};

/**
 * 
 * https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/core/shallowEqual.js#L22
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 * 
 * @param {{}} A 
 * @param {{}} B 
 * @returns {boolean}
 */
export let objectsShallowEqual = (A, B) => {
    if (A === B) {
        return true;
    }
    let keysA = Object.keys(A);
    let keysB = Object.keys(B);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (let i = keysA.length - 1; i >= 0; i--) {
        if (!(
            hasOwnProperty.call(B, keysA[i]) &&
            Object.is(A[keysA[i]], B[keysA[i]])
        )) {
            return false;
        }
    }
    return true;
};
