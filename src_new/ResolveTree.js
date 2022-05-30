import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffects, mountEffects} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {isFunction} from './Util';
import {RootType} from './VirtualNode';
import {queueWork, workLoop} from './WorkLoop';

export const resolveTree = (current) => {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, current, mountNodesMap, unmountNodesMap);

    queueWork(() => {
        mountNodesMap.forEach((isNewlyMounted, node) => {
            mountEffects(node, isNewlyMounted);
        });
        unmountNodesMap.forEach((isUnmounted, node) => {
            destroyEffects(node, isUnmounted);
        });
    });
}

const _performUnitOfWork = (current, root, mountNodesMap, unmountNodesMap) => {
    reconcileChildren(current);

    // RootType never changes its child
    // Do nothing anymore
    if (current.type_ === RootType) {
        return;
    }

    if (current === root) {
        unmountNodesMap.set(current, false);
        mountNodesMap.set(current, false);
    } else {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            if (isFunction(current.type_)) {
                unmountNodesMap.set(current.alternative_, false);
                mountNodesMap.set(current, false);
            }
            current.alternative_ = null;
        } else {
            insertView(current);
            if (isFunction(current.type_)) {
                mountNodesMap.set(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            workLoop((deletedNode) => {
                if (isFunction(deletedNode.type_)) {
                    unmountNodesMap.set(deletedNode, true);
                }
            }, subtree);

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}