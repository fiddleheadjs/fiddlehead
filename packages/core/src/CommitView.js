import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {rehydrateView} from './HydrateView';
import {insertNativeNodeAfter, removeNativeNode} from './NativeDOM';

// Important!!!
// This module does not handle Portal nodes

export function updateView(newVNode, oldVNode) {
    rehydrateView(newVNode, oldVNode);

    if (newVNode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(newVNode.parent_);
        if (mpt !== null) {
            mpt.mountingRef_ = newVNode.nativeNode_;
        }
    }
}

export function insertView(vnode) {
    if (vnode.nativeNode_ !== null) {
        const mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            insertNativeNodeAfter(mpt.nativeNode_, vnode.nativeNode_, mpt.mountingRef_);
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
}

export function deleteView(vnode) {
    if (vnode.nativeNode_ !== null) {
        removeNativeNode(vnode.nativeNode_);
    } else {
        walkNativeChildren(removeNativeNode, vnode);
    }
}
