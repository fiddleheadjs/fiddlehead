import {hydrateView, rehydrateView} from './HydrateView';

// Important Note
// This module does not handle RootType nodes

export const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const hostVirtualNode = _findHostVirtualNode(newVirtualNode);
        if (hostVirtualNode !== null) {
            hostVirtualNode.lastManipulatedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
}

export const insertView = (virtualNode) => {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const hostVirtualNode = _findHostVirtualNode(virtualNode);
        if (hostVirtualNode !== null) {
            const nativeNodeAfter = (
                hostVirtualNode.lastManipulatedNativeChild_ !== null
                    ? hostVirtualNode.lastManipulatedNativeChild_.nextSibling
                    : hostVirtualNode.nativeNode_.firstChild
            );
            hostVirtualNode.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            hostVirtualNode.lastManipulatedNativeChild_ = virtualNode.nativeNode_;
        }
    }
}

export const deleteView = (subtree) => {
    _loopClosestNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}

// Find the virtual node in the parent chain which its native node is not null
const _findHostVirtualNode = (virtualNode) => {
    let current = virtualNode.parent_;

    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current;
        }
        current = current.parent_;
    }
}

const _loopClosestNativeNodes = (virtualNode, callback) => {
    let root = virtualNode;
    let current = virtualNode;

    while (true) {
        if (current.nativeNode_ !== null) {
            callback(current.nativeNode_);
        } else if (current.child_ !== null) {
            current = current.child_;
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
        }
        current = current.sibling_;
        continue;
    }
}
