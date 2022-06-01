const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export const attachVirtualNode = (nativeNode, virtualNode) => {
    nativeNode[PROP_VNODE] = virtualNode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
export const extractVirtualNode = (nativeNode) => {
    return nativeNode[PROP_VNODE];
}
