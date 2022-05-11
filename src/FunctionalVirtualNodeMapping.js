import {stringifyPath} from './Path';
import {hasOwnProperty} from './Util';

/**
 *
 * @type {Object<VirtualNode>}
 */
const functionalVirtualNodeMap = {};

export function findFunctionalVirtualNode(path) {
    const pathString = stringifyPath(path);

    if (hasOwnProperty(functionalVirtualNodeMap, pathString)) {
        return functionalVirtualNodeMap[pathString];
    }

    return null;
}

export function linkFunctionalVirtualNode(path, functionalVirtualNode) {
    functionalVirtualNodeMap[stringifyPath(path)] = functionalVirtualNode;
}

export function unlinkFunctionalVirtualNode(path) {
    delete functionalVirtualNodeMap[stringifyPath(path)];
}
