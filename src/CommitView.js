import {findHostVirtualNode, loopClientNativeNodes} from './HostClient';
import {hydrateView, rehydrateView} from './HydrateView';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const host = findHostVirtualNode(newVirtualNode.parent_);
        if (host !== null) {
            host.lastManipulatedClient_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const host = findHostVirtualNode(virtualNode.parent_);
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
    loopClientNativeNodes(subtree, function (nativeNode) {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
}
