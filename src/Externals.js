import {createContainerId, createFunctionalTypeAlias} from './Path';
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
    if (!hasOwnProperty(container, PROP_CONTAINER_ID)) {
        container[PROP_CONTAINER_ID] = createContainerId();
    }
    return container[PROP_CONTAINER_ID];
}

/**
 *
 * @param {Function} type
 * @returns {string}
 */
export function getFunctionalTypeAlias(type) {
    if (!hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias(type);
    }
    return type[PROP_TYPE_ALIAS];
}

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
}
