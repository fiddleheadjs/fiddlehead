import {createContainerId, createFunctionalTypeAlias} from './Path';
import {hasOwnProperty} from './Util';
import {VirtualNode} from './VirtualNode';

const PROP_COMPONENT_TYPE = 'Hook$ComponentType';
const PROP_CONTAINER_ID = 'Hook$ContainerId';
const PROP_VIRTUAL_NODE = 'Hook$VirtualNode';

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
    if (!hasOwnProperty(type, PROP_COMPONENT_TYPE)) {
        type[PROP_COMPONENT_TYPE] = createFunctionalTypeAlias(type);
    }
    return type[PROP_COMPONENT_TYPE];
}

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
}
