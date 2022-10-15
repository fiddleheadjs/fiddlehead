export let hasOwnProperty = Object.prototype.hasOwnProperty;

export let slice = Array.prototype.slice;

export let isString = (value) => {
    return typeof value === 'string';
};

export let isNumber = (value) => {
    return typeof value === 'number';
};

export let isFunction = (value) => {
    return typeof value === 'function';
};

export let isArray = (value) => {
    return value instanceof Array;
};

/**
 * 
 * Object.is equivalence.
 * https://github.com/facebook/fbjs/blob/main/packages/fbjs/src/core/shallowEqual.js#L22
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 * 
 * @param {any} x 
 * @param {any} y 
 * @returns {boolean}
 */
 export let theSame = (x, y) => {
    // SameValue algorithm
    if (x === y) {
        // +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    } else {
        // NaN == NaN
        return x !== x && y !== y;
    }
};

/**
 * 
 * @param {{}} A 
 * @param {{}} B 
 * @returns {boolean}
 */
export let objectsShallowEqual = (A, B) => {
    if (A === B) {
        return true;
    }
    let kA = Object.keys(A);
    let kB = Object.keys(B);
    if (kA.length !== kB.length) {
        return false;
    }
    for (let k, i = kA.length - 1; i >= 0; --i) {
        k = kA[i];
        if (!(
            hasOwnProperty.call(B, k) &&
            theSame(A[k], B[k])
        )) {
            return false;
        }
    }
    return true;
};

/**
 * 
 * @param {[]} A
 * @param {[]} B 
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
        if (!theSame(A[i], B[i])) {
            return false;
        }
    }
    return true;
};
