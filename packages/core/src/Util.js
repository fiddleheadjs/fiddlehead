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
export let compareArrays = (A, B) => {
    if (A.length !== B.length) {
        return false;
    }
    for (let i = A.length - 1; i >= 0; --i) {
        if (!_is(A[i], B[i])) {
            return false;
        }
    }
    return true;
};

/**
 * 
 * @param {{}} A 
 * @param {{}} B 
 * @returns {boolean}
 */
export let compareObjects = (A, B) => {
    if (_is(A, B)) {
        return true;
    }
    let keysA = Object.keys(A);
    let keysB = Object.keys(B);
    // console.log({keysA, keysB})
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (let i = keysA.length - 1; i >= 0; i--) {
        if (!(
            hasOwnProperty.call(B, keysA[i]) &&
            _is(A[keysA[i]], B[keysA[i]])
        )) {
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
 * @param {any} x 
 * @param {any} y 
 * @returns {boolean}
 */
let _is = (x, y) => {
    return x === y;
    // SameValue algorithm
    if (x === y) { // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
    }
};
