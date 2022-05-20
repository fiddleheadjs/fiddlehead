import {createFunctionalTypeAlias, createRootId} from './VirtualNode';
import {hasOwnProperty} from './Util';

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_VIRTUAL_NODE = 'hook_vnode';
const PROP_ROOT_ID = 'hook_rootid';

/**
 *
 * @param {Function} type
 * @returns {string}
 */
export const getFunctionalTypeAlias = (type) => {
    if (hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        return type[PROP_TYPE_ALIAS];
    }

    return (
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias(type)
    );
}

/**
 * 
 * @param {Element} root 
 * @returns {string}
 */
export const getRootId = (root) => {
    if (hasOwnProperty(root, PROP_ROOT_ID)) {
        return root[PROP_ROOT_ID];
    }

    return (
        root[PROP_ROOT_ID] = createRootId()
    );
}

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export const attachVirtualNode = (nativeNode, virtualNode) => {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
export const extractVirtualNode = (nativeNode) => {
    return nativeNode[PROP_VIRTUAL_NODE];
}
