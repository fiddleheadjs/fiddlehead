import {pathToString} from './Path';

/**
 *
 * @type {Map<string, VirtualNode>}
 */
const memoizedHooksMap = new Map();

export function findMemoizedHooks(path) {
    const pathString = pathToString(path);

    if (memoizedHooksMap.has(pathString)) {
        return memoizedHooksMap.get(pathString);
    }

    return null;
}

export function linkMemoizedHooks(path, hooks) {
    const pathString = pathToString(path);

    memoizedHooksMap.set(pathString, hooks);
}

export function unlinkMemoizedHooks(path) {
    const pathString = pathToString(path);

    memoizedHooksMap.delete(pathString);
}
