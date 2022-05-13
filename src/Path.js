/**
 * 
 * @param {Array<string|number>} path
 * @returns {string}
 */
export function pathToString(path) {
    return path.join('/');
}

// Note:
// Use special URI characters as prefixes

/**
 * 
 * @param {*} key 
 * @returns {string}
 */
export function escapeVirtualNodeKey(key) {
    return '@' + encodeURIComponent(key);
}

let functionalTypeInc = 0;

/**
 * 
 * @param {Function} type 
 * @returns {string}
 */
export function createFunctionalTypeAlias(type) {
    return /*type.name +*/ '{' + (++functionalTypeInc).toString(36);
}

let containerIdInc = 0;

/**
 * 
 * @returns {string}
 */
export function createContainerId() {
    return '~' + (++containerIdInc).toString(36);
}
