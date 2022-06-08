import {resolveMountingPoint, walkNativeSubtrees} from './MountingPoint';
import {hydrateView, rehydrateView} from './HydrateView';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const mp = resolveMountingPoint(newVirtualNode.parent_);
        if (mp !== null) {
            mp.lastManipulatedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const mp = resolveMountingPoint(virtualNode.parent_);
        if (mp !== null) {
            const nativeNodeAfter = (mp.lastManipulatedNativeChild_ !== null
                ? mp.lastManipulatedNativeChild_.nextSibling
                : mp.nativeNode_.firstChild
            );
            mp.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            mp.lastManipulatedNativeChild_ = virtualNode.nativeNode_;
        }
    }
}

export function deleteView(virtualNode) {
    walkNativeSubtrees(virtualNode, function (nativeSubtree) {
        if (nativeSubtree.parentNode !== null) {
            nativeSubtree.parentNode.removeChild(nativeSubtree);
        }
    });
}
