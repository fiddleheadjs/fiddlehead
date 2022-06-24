import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, EFFECT_LAYOUT, EFFECT_NORMAL, mountEffects} from './EffectHook';
import {hydrateView} from './HydrateView';
import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {reconcileChildren} from './Reconciliation';
import {Portal} from './VNode';

export function renderTree(current) {
    const effectMountNodes = new Map();
    const effectDestroyNodes = new Map();
    
    // The mounting point of the current
    const mpt = resolveMountingPoint(current);

    // In the tree, the mounting point lies at a higher level
    // than the current, so we need to initialize/cleanup
    // its temporary properties from outside of the work loop
    walkNativeChildren(function (nativeChild) {
        mpt.mountingRef_ = nativeChild;
    }, mpt, current);

    // Main work
    _workLoop(
        _performUnitOfWork, _onReturn, current,
        effectMountNodes, effectDestroyNodes
    );
    
    // Cleanup
    mpt.mountingRef_ = null;

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

// Optimize insertion to reduce reflow number
const INSERT_ON_RETURN = 0;
const INSERT_OFFSCREEN = 1;

function _performUnitOfWork(current, root, effectMountNodes, effectDestroyNodes) {
    const isRenderRoot = current === root;
    
    // Reconcile current's children
    reconcileChildren(current, isRenderRoot);

    // Portal nodes never change the view itself
    if (current.type_ !== Portal) {
        if (isRenderRoot) {
            if (current.effectHook_ !== null) {
                effectDestroyNodes.set(current, false);
                effectMountNodes.set(current, false);
            }
        } else {
            if (current.alternate_ !== null) {
                updateView(current, current.alternate_);
                if (current.effectHook_ !== null) {
                    effectDestroyNodes.set(current.alternate_, false);
                    effectMountNodes.set(current, false);
                }
                current.alternate_ = null;
            } else {
                hydrateView(current);
                if (current.child_ !== null) {
                    // We always have parent here, because
                    // this area is under the render root
                    if (current.parent_.insertion_ !== null) {
                        current.insertion_ = INSERT_OFFSCREEN;
                        insertView(current);
                    } else {
                        // Insert-on-return nodes must have a native node!
                        if (current.nativeNode_ !== null) {
                            current.insertion_ = INSERT_ON_RETURN;
                        }
                    }
                } else {
                    insertView(current);
                }
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
            _workLoop(function (node) {
                if (node.effectHook_ !== null) {
                    effectDestroyNodes.set(node, true);
                }
            }, null, current.deletions_[i]);
        }
        current.deletions_ = null;
    }
}

// Callback called after walking through a node and all of its ascendants
function _onReturn(current) {
    // Process the insert-on-return node before walk out of its subtree
    if (current.insertion_ === INSERT_ON_RETURN) {
        insertView(current);
    }

    // This is when we cleanup the remaining temporary properties
    current.mountingRef_ = null;
    current.insertion_ = null;
}

// Reference: https://github.com/facebook/react/issues/7942
function _workLoop(performUnit, onReturn, root, D0, D1) {
    let current = root;
    while (true) {
        performUnit(current, root, D0, D1);
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
