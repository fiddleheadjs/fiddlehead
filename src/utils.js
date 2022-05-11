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

export function isPlainObject(value) {
    return (!!value) && (value.constructor === Object);
}

export function isEmpty(value) {
    return value === undefined || value === null;
}
