import {hydrateView, rehydrateView} from './HydrateView';

// Important Note
// This module does not handle RootType nodes

export const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const hostNode = _findHostNode(newVirtualNode);
        if (hostNode !== null) {
            hostNode.lastCommittedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
}

export const insertView = (node) => {
    hydrateView(node);

    if (node.nativeNode_ !== null) {
        const hostNode = _findHostNode(node);
        if (hostNode !== null) {
            const nativeNodeAfter = (
                hostNode.lastCommittedNativeChild_ !== null
                    ? hostNode.lastCommittedNativeChild_.nextSibling
                    : hostNode.firstChild
            );
            hostNode.nativeNode_.insertBefore(node.nativeNode_, nativeNodeAfter);
            hostNode.lastCommittedNativeChild_ = node.nativeNode_;
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
const _findHostNode = (node) => {
    let current = node.parent_;

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

const _loopClosestNativeNodes = (node, callback) => {
    let root = node;
    let current = node;

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
