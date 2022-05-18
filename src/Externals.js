import {createFunctionalTypeAlias} from './VirtualNode';
import {hasOwnProperty} from './Util';
import {VirtualNode} from './VirtualNode';

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_VIRTUAL_NODE = 'hook_vnode';

/**
 *
 * @param {Function} type
 * @returns {string}
 */
export function getFunctionalTypeAlias(type) {
    if (hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        return type[PROP_TYPE_ALIAS];
    }

    return (
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias(type)
    );
}

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
export function getAttachedVirtualNode(nativeNode) {
    return nativeNode[PROP_VIRTUAL_NODE];
}
