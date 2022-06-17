import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {rehydrateView} from './HydrateView';
import {insertNativeNodeAfter, removeNativeNode} from './NativeDOM';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVirtualNode, oldVirtualNode) {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(newVirtualNode.parent_);
        if (mpt !== null) {
            mpt.mountingRef_ = newVirtualNode.nativeNode_;
        }
    }
}

export function insertView(virtualNode) {
    if (virtualNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(virtualNode.parent_);
        if (mpt !== null) {
            insertNativeNodeAfter(mpt.nativeNode_, virtualNode.nativeNode_, mpt.mountingRef_);
            mpt.mountingRef_ = virtualNode.nativeNode_;
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