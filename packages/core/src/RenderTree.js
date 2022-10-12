import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, EFFECT_LAYOUT, EFFECT_NORMAL, mountEffects} from './EffectHook';
import {hydrateView} from './HydrateView';
import {resolveMountingPoint, walkNativeChildren} from './MountingPoint';
import {reconcileChildren} from './ReconcileChildren';
import {Portal, VNode} from './VNode';

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
        _performUnitOfWork, _onReturn, current,
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

// Optimize insertion to reduce reflow number
const INSERT_ON_RETURN = 0;
const INSERT_OFFSCREEN = 1;

/**
 * 
 * @param {VNode} current 
 * @param {VNode} root 
 * @param {Map<VNode, boolean>} effectMountNodes 
 * @param {Map<VNode, boolean>} effectDestroyNodes 
 * @returns {boolean} shouldWalkDeeper
 */
let _performUnitOfWork = (current, root, effectMountNodes, effectDestroyNodes) => {
    let isRenderRoot = current === root;
    
    // Reconcile current's direct children
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
                if (current === current.alternate_) {
                    // Stop walking deeper
                    return false;
                }
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
            _workLoop((deleted) => {
                if (deleted.effectHook_ !== null) {
                    effectDestroyNodes.set(deleted, true);
                }
                
                // Important!!!
                // Cancel the update schedule on the deleted nodes
                if (deleted.updateId_ !== null) {
                    clearTimeout(deleted.updateId_);
                    deleted.updateId_ = null;
                }
            }, null, current.deletions_[i]);
        }
        current.deletions_ = null;
    }

    // Cancel the update schedule on the current node
    if (current.updateId_ !== null) {
        clearTimeout(current.updateId_);
        current.updateId_ = null;
    }

    return true;
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
let _workLoop = (performUnit, onReturn, root, D0, D1) => {
    let current = root;
    let shouldWalkDeeper;
    while (true) {
        shouldWalkDeeper = performUnit(current, root, D0, D1);
        if (shouldWalkDeeper && current.child_ !== null) {
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
};
