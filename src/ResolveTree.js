import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, EFFECT_LAYOUT, EFFECT_NORMAL, mountEffects} from './EffectHook';
import {resolveMountingPoint} from './MountingPoint';
import {reconcileChildren} from './Reconciliation';
import {Portal} from './VirtualNode';

// Append/remove children into/from a fragment
// Then finally append the fragment into the live DOM
// This will improve the performance because the browser only reflows once
const domFragment = new DocumentFragment();

export function resolveTree(current) {
    const effectMountNodes = new Map();
    const effectDestroyNodes = new Map();
    
    // Main work
    const mp = resolveMountingPoint(current);
    const mpNative = mp.nativeNode_;
    mp.nativeNode_ = domFragment;
    _workLoop(
        _performUnitOfWork, _onReturn, current,
        effectMountNodes, effectDestroyNodes
    );
    mpNative.appendChild(domFragment);
    mp.nativeNode_ = mpNative;

    // Layout effects
    effectDestroyNodes.forEach(function (isUnmounted, vnode) {
        destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
    });
    effectMountNodes.forEach(function (isNewlyMounted, vnode) {
        mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
    });

    // Effects
    setTimeout(function () {
        effectDestroyNodes.forEach(function (isUnmounted, vnode) {
            destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
        });
        effectMountNodes.forEach(function (isNewlyMounted, vnode) {
            mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
        });
    });
}

function _performUnitOfWork(current, root, effectMountNodes, effectDestroyNodes) {
    const isSubtreeRoot = current === root;
    
    reconcileChildren(current, isSubtreeRoot);

    // Portal nodes never change the view itself
    if (current.type_ !== Portal) {
        if (isSubtreeRoot) {
            if (current.effectHook_ !== null) {
                effectDestroyNodes.set(current, false);
                effectMountNodes.set(current, false);
            }
        } else {
            if (current.alternative_ !== null) {
                updateView(current, current.alternative_);
                if (current.effectHook_ !== null) {
                    effectDestroyNodes.set(current.alternative_, false);
                    effectMountNodes.set(current, false);
                }
                current.alternative_ = null;
            } else {
                insertView(current);
                if (current.effectHook_ !== null) {
                    effectMountNodes.set(current, true);
                }
            }
        }
    }
    
    // Delete subtrees that no longer exist
    if (current.deletions_ !== null) {
        for (let i = 0; i < current.deletions_.length; ++i) {
            deleteView(current.deletions_[i]);
            _workLoop(function (vnode) {
                if (vnode.effectHook_ !== null) {
                    effectDestroyNodes.set(vnode, true);
                }
            }, null, current.deletions_[i]);
        }
        current.deletions_ = null;
    }
}

// Callback called after walking through a node and all of its ascendants
function _onReturn(current) {
    // This is when we cleanup the remaining temp props
    if (current.lastManipulatedNativeChild_ !== null) {
        current.lastManipulatedNativeChild_ = null;
    }
}

// Reference: https://github.com/facebook/react/issues/7942
function _workLoop(performUnit, onReturn, root, r0, r1) {
    let current = root;
    while (true) {
        performUnit(current, root, r0, r1);
        if (current.child_ !== null) {
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
            if (onReturn !== null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
}
