const PROP_VIRTUAL_NODE = 'hook_vnode';

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
