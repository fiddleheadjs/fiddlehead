/**
 *
 * @type {Map<string, Array>}
 */
const memoizedHooksMap = new Map();

/**
 * 
 * @param {string} path 
 * @returns {Array|null}
 */
export function findMemoizedHooks(path) {
    return memoizedHooksMap.get(path) || null;
}

/**
 * 
 * @param {string} path 
 * @param {Array} hooks 
 */
export function linkMemoizedHooks(path, hooks) {
    memoizedHooksMap.set(path, hooks);
}

/**
 * 
 * @param {string} path 
 */
export function unlinkMemoizedHooks(path) {
    memoizedHooksMap.delete(path);
}
