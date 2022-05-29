import {hydrateView, rehydrateView} from './HydrateView';

// Important Note
// This module does not handle RootType

export const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);
}

export const insertView = (node) => {
    hydrateView(node);

    if (node.nativeNode_ !== null) {
        const nativeHost = _findNativeHost(node);
        if (nativeHost !== null) {
            // TODO: insert before a ref node
            nativeHost.appendChild(node.nativeNode_);
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

const _findNativeHost = (node) => {
    let current = node.parent_;

    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current.nativeNode_;
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
