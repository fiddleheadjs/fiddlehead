import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, EFFECT_LAYOUT, EFFECT_NORMAL, mountEffects} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {Portal} from './VirtualNode';
import {queueWork, workLoop} from './WorkLoop';

export function resolveTree(current) {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, _onReturn, current, mountNodesMap, unmountNodesMap);

    unmountNodesMap.forEach(function (isUnmounted, vnode) {
        destroyEffects(EFFECT_LAYOUT, vnode, isUnmounted);
    });
    mountNodesMap.forEach(function (isNewlyMounted, vnode) {
        mountEffects(EFFECT_LAYOUT, vnode, isNewlyMounted);
    });

    queueWork(function () {
        unmountNodesMap.forEach(function (isUnmounted, vnode) {
            destroyEffects(EFFECT_NORMAL, vnode, isUnmounted);
        });
        mountNodesMap.forEach(function (isNewlyMounted, vnode) {
            mountEffects(EFFECT_NORMAL, vnode, isNewlyMounted);
        });
    });
}

function _performUnitOfWork(current, root, mountNodesMap, unmountNodesMap) {
    const isSubtreeRoot = current === root;
    
    reconcileChildren(current, isSubtreeRoot);

    // Portal nodes never change their child
    // Do nothing anymore
    if (current.type_ === Portal) {
        return;
    }

    if (isSubtreeRoot) {
        if (current.effectHook_ !== null) {
            unmountNodesMap.set(current, false);
            mountNodesMap.set(current, false);
        }
    } else {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            if (current.effectHook_ !== null) {
                unmountNodesMap.set(current.alternative_, false);
                mountNodesMap.set(current, false);
            }
            current.alternative_ = null;
        } else {
            insertView(current);
            if (current.effectHook_ !== null) {
                mountNodesMap.set(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        const deletions = current.deletions_;
        current.deletions_ = null;

        for (let i = 0; i < deletions.length; ++i) {
            deleteView(deletions[i]);
        }

        queueWork(function () {
            for (let i = 0; i < deletions.length; ++i) {
                workLoop(function (vnode) {
                    if (vnode.effectHook_ !== null) {
                        unmountNodesMap.set(vnode, true);
                    }
                }, null, deletions[i]);
            }
        });
    }
}

// Callback called after walking through a node and all of its ascendants
function _onReturn(current) {
    // This is when we cleanup the remaining temp props
    if (current.lastManipulatedClientNativeNode_ !== null) {
        current.lastManipulatedClientNativeNode_ = null;
    }
}
