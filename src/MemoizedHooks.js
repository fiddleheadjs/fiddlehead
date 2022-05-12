import {stringifyPath} from './Path';
import {hasOwnProperty} from './Util';

/**
 *
 * @type {Object<VirtualNode>}
 */
const memoizedHooksMap = Object.create(null);

export function findMemoizedHooks(path) {
    const pathString = stringifyPath(path);

    if (hasOwnProperty(memoizedHooksMap, pathString)) {
        return memoizedHooksMap[pathString];
    }

    return null;
}

export function linkMemoizedHooks(path, functionalVirtualNode) {
    memoizedHooksMap[stringifyPath(path)] = functionalVirtualNode;
}

export function unlinkMemoizedHooks(path) {
    delete memoizedHooksMap[stringifyPath(path)];
}
