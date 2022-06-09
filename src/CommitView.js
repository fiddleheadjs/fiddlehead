import {resolveMountingPoint, walkNativeSubtrees} from './MountingPoint';
import {hydrateView, rehydrateView} from './HydrateView';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(newVirtualNode.parent_);
        if (mpt !== null) {
            mpt.lastManipulatedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(virtualNode.parent_);
        if (mpt !== null) {
            const nativeNodeAfter = (mpt.lastManipulatedNativeChild_ !== null
                ? mpt.lastManipulatedNativeChild_.nextSibling
                : mpt.nativeNode_.firstChild
            );
            mpt.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            mpt.lastManipulatedNativeChild_ = virtualNode.nativeNode_;
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
