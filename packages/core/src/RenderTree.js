import {insertView, updateView, deleteView, touchView} from './CommitView';
import {mountEffects, destroyEffects, EFFECT_NORMAL, EFFECT_LAYOUT} from './EffectHook';
import {hydrateView} from './HydrateView';
import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {reconcileChildren} from './ReconcileChildren';
import {Portal} from './VNode';

/**
 * 
 * @param {VNode} current
 */
export let renderTree = (current) => {
    let effectMountNodes = new Map();
    let effectDestroyNodes = new Map();
    
    // The mounting point of the current
    let mpt = resolveMountingPoint(current);

    // In the tree, the mounting point lies at a higher level
    // than the current, so we need to initialize/cleanup
    // its temporary properties from outside of the work loop
    walkNativeChildren((nativeChild) => {
        mpt.mountingRef_ = nativeChild;
    }, mpt, current);

    // Main work
    _workLoop(
        current, 
        _performUnitOfWork, _onSkip, _onReturn,
        effectMountNodes, effectDestroyNodes
    );
    
    // Cleanup
    mpt.mountingRef_ = null;

    // Layout effects
    effectDestroyNodes.forEach((isUnmounted, vnode) => {
        destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
    });
    effectMountNodes.forEach((isNewlyMounted, vnode) => {
        mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
    });

    // Effects
    setTimeout(() => {
        effectDestroyNodes.forEach((isUnmounted, vnode) => {
            destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
        });
        effectMountNodes.forEach((isNewlyMounted, vnode) => {
            mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
        });
    });
};

// Optimize the insertion to reduce the number of reflows
const INSERT_ON_RETURN = 0;
const INSERT_OFFSCREEN = 1;

/**
 * 
 * @param {VNode} current 
 * @param {VNode} root 
 * @param {Map<VNode, boolean>} effectMountNodes 
 * @param {Map<VNode, boolean>} effectDestroyNodes 
 * @returns {VNode|null} skipFrom
 */
let _performUnitOfWork = (current, root, effectMountNodes, effectDestroyNodes) => {
    let isRenderRoot = current === root;
    let isPortal = current.type_ === Portal;
    
    // Cleanup the update scheduled on the current node.
    // Do this before reconciliation because the current node can
    // be scheduled for another update while the reconciliation
    if (current.updateId_ !== null) {
        clearTimeout(current.updateId_);
        current.updateId_ = null;
    }

    // Reconcile current's direct children
    reconcileChildren(current, isRenderRoot);

    let skipFrom = null;

    // Portal nodes never change the view itself
    if (!isPortal) {
        if (isRenderRoot) {
            if (current.effectHook_ !== null) {
                effectDestroyNodes.set(current, false);
                effectMountNodes.set(current, false);
            }
        } else {
            if (current.alternate_ !== null) {
                if (current.alternate_ === current) {
                    // This node does not changed,
                    // so skip reconciliation for its subtree
                    skipFrom = current;
                } else {
                    updateView(current, current.alternate_);
                    if (current.effectHook_ !== null) {
                        effectDestroyNodes.set(current.alternate_, false);
                        effectMountNodes.set(current, false);
                    }
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
            _workLoop(current.deletions_[i], (deleted) => {
                if (deleted.effectHook_ !== null) {
                    effectDestroyNodes.set(deleted, true);
                }
                
                // Important!!!
                // Cancel the update schedule on the deleted nodes
                if (deleted.updateId_ !== null) {
                    clearTimeout(deleted.updateId_);
                    deleted.updateId_ = null;
                }
            });
        }
        current.deletions_ = null;
    }

    return skipFrom;
};

let _onSkip = (current, root) => {
    let isRenderRoot = current === root;
    let isPortal = current.type_ === Portal;

    if (isRenderRoot || isPortal) {
        // Do nothing if the current is the render root or a portal
    } else {
        // Though the current is skipped for reconciliation
        // but we need to update the mounting ref
        // so insertions after can work correctly
        touchView(current);
    }
};

// Callback called after walking through a node and all of its ascendants
let _onReturn = (current) => {
    // Process the insert-on-return node before walk out of its subtree
    if (current.insertion_ === INSERT_ON_RETURN) {
        insertView(current);
    }

    // This is when we cleanup the remaining temporary properties
    current.mountingRef_ = null;
    current.insertion_ = null;
};

// Reference: https://github.com/facebook/react/issues/7942
let _workLoop = (root, performUnit, onSkip, onReturn, D0, D1) => {
    let current = root;
    let skipFrom = null;
    while (true) {
        if (skipFrom == null) {
            skipFrom = performUnit(current, root, D0, D1);
        } else {
            if (onSkip != null) {
                onSkip(current, root);
            }
        }
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
            if (skipFrom === current) {
                skipFrom = null;
            }
            if (onReturn != null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
};
