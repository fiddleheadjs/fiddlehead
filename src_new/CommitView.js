import {hydrateView, rehydrateView} from './HydrateView';
import {RootType} from './VirtualNode';

export const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);
}

export const insertView = (node) => {
    hydrateView(node);

    const nativeHost = _findNativeHost(node);

    if (nativeHost !== null) {
        if (node.nativeNode_)
        nativeHost.appendChild(node.nativeNode_);
    }
}

export const deleteView = (subtree) => {
    _loopClosestNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}

const _findNativeHost = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ !== null) {
        return virtualNode.parent_.nativeNode_;
    }
    
    return _findNativeHost(virtualNode.parent_);
}

const _loopClosestNativeNodes = (virtualNode, callback) => {
    if (virtualNode.nativeNode_ !== null) {
        callback(virtualNode.nativeNode_);
        return;
    }
    
    let childNode = virtualNode.child_;
    while (childNode !== null) {
        _loopClosestNativeNodes(childNode, callback);
        childNode = childNode.sibling_;
    }
}
