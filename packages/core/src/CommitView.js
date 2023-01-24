import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {rehydrateView} from './HydrateView';
import {insertNativeNodeAfter, removeNativeNode} from './NativeDOM';

// Important!!!
// This module does not handle Portal nodes

export let insertView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        let mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            insertNativeNodeAfter(mpt.nativeNode_, vnode.nativeNode_, mpt.mountingRef_);
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
};

export let updateView = (newVNode, oldVNode) => {
    rehydrateView(newVNode, oldVNode);
    touchView(newVNode);
};

export let touchView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        let mpt = resolveMountingPoint(vnode.parent_);
        if (mpt !== null) {
            mpt.mountingRef_ = vnode.nativeNode_;
        }
    }
};

export let deleteView = (vnode) => {
    if (vnode.nativeNode_ !== null) {
        removeNativeNode(vnode.nativeNode_);
    } else {
        walkNativeChildren(removeNativeNode, vnode);
    }
};
