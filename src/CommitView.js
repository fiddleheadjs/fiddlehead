import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {hydrateView, rehydrateView} from './HydrateView';
import {insertNativeNodeAfter, removeNativeNode} from './NativeDOM';

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
            insertNativeNodeAfter(mpt.nativeNode_, virtualNode.nativeNode_, mpt.lastTouchedNativeChild_);
            mpt.lastTouchedNativeChild_ = virtualNode.nativeNode_;
        }
    }
}

export function deleteView(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        removeNativeNode(virtualNode.nativeNode_);
    } else {
        walkNativeChildren(removeNativeNode, virtualNode);
    }
}
