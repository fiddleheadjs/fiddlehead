import {resolveMountingPoint, walkNativeChildren, walkNativeSubtrees} from './MountingPoint';
import {hydrateView, rehydrateView} from './HydrateView';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(newVirtualNode.parent_);
        if (mpt !== null) {
            mpt.lastTouchedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(virtualNode.parent_);
        if (mpt !== null) {
            const nativeNodeAfter = (mpt.lastTouchedNativeChild_ !== null
                ? mpt.lastTouchedNativeChild_.nextSibling
                : mpt.nativeNode_.firstChild
            );
            mpt.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            mpt.lastTouchedNativeChild_ = virtualNode.nativeNode_;
        }
    }
}

export function deleteView(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        _removeNativeNode(virtualNode.nativeNode_);
    } else {
        walkNativeChildren(_removeNativeNode, virtualNode);
    }
}

function _removeNativeNode(nativeNode) {
    if (nativeNode.parentNode !== null) {
        nativeNode.parentNode.removeChild(nativeNode);
    }
}
