import {createContainerId, createFunctionalTypeAlias} from './VirtualNode';
import {hasOwnProperty} from './Util';
import {VirtualNode} from './VirtualNode';

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_CONTAINER_ID = 'hook_cid';
const PROP_VIRTUAL_NODE = 'hook_vnode';

/**
 * 
 * @param {Element} container 
 * @returns {string}
 */
export function getContainerId(container) {
    if (hasOwnProperty(container, PROP_CONTAINER_ID)) {
        return container[PROP_CONTAINER_ID];
    }
    
    return (
        container[PROP_CONTAINER_ID] = createContainerId()
    );
}

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
