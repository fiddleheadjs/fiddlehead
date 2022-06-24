const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
export function attachVirtualNode(nativeNode, virtualNode) {
    nativeNode[PROP_VNODE] = virtualNode;
}

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
export function extractVirtualNode(nativeNode) {
    return nativeNode[PROP_VNODE];
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
 export function linkNativeNode(virtualNode, nativeNode) {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ !== null) {
        virtualNode.ref_.current = nativeNode;
    }
}
