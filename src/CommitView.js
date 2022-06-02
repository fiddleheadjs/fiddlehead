import {hydrateView, rehydrateView} from './HydrateView';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(newVirtualNode);
        if (host !== null) {
            host.lastManipulatedClient_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(virtualNode);
        if (host !== null) {
            const nativeNodeAfter = (
                host.lastManipulatedClient_ !== null
                    ? host.lastManipulatedClient_.nextSibling
                    : host.nativeNode_.firstChild
            );
            host.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            host.lastManipulatedClient_ = virtualNode.nativeNode_;
        }
    }
}

export function deleteView(subtree) {
    _loopClientNativeNodes(subtree, function (nativeNode) {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}

// Find the virtual node in the parent chain which its native node is not null
function _findHostVirtualNode(virtualNode) {
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

function _loopClientNativeNodes(virtualNode, callback) {
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
