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
export const findMemoizedHooks = (path) => {
    return memoizedHooksMap.get(path) || null;
}

/**
 * 
 * @param {string} path 
 * @param {Array} hooks 
 */
export const linkMemoizedHooks = (path, hooks) => {
    memoizedHooksMap.set(path, hooks);
}

/**
 * 
 * @param {string} path 
 */
export const unlinkMemoizedHooks = (path) => {
    memoizedHooksMap.delete(path);
}
