import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, mountEffects} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {Root} from './VirtualNode';
import {queueWork, workLoop} from './WorkLoop';

export const resolveTree = (current) => {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, _onReturn, current, mountNodesMap, unmountNodesMap);

    queueWork(() => {
        unmountNodesMap.forEach((isUnmounted, node) => {
            destroyEffects(node, isUnmounted);
        });
        mountNodesMap.forEach((isNewlyMounted, node) => {
            mountEffects(node, isNewlyMounted);
        });
    });
}

const _performUnitOfWork = (current, root, mountNodesMap, unmountNodesMap) => {
    reconcileChildren(current);

    // RootType never changes its child
    // Do nothing anymore
    if (current.type_ === Root) {
        return;
    }

    if (current === root) {
        if (current.hook_ !== null) {
            unmountNodesMap.set(current, false);
            mountNodesMap.set(current, false);
        }
    } else {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            if (current.hook_ !== null) {
                unmountNodesMap.set(current.alternative_, false);
                mountNodesMap.set(current, false);
            }
            current.alternative_ = null;
        } else {
            insertView(current);
            if (current.hook_ !== null) {
                mountNodesMap.set(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            queueWork(() => {
                workLoop((deletion) => {
                    if (deletion.hook_ !== null) {
                        unmountNodesMap.set(deletion, true);
                    }
                }, null, subtree);
            });

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}

// Callback called after walking through a node and all of its ascendants
const _onReturn = (current) => {
    // This is when we cleanup the remaining temp props
    if (current.lastCommittedNativeChild_ !== null) {
        current.lastCommittedNativeChild_ = null;
    }
}
