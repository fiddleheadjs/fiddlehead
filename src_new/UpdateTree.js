import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {isFunction} from './Util';
import {workLoop} from './WorkLoop';

export const updateTree = (current) => {
    const effectNodeMap = new Map();
    
    workLoop(_performUnitOfWork, current, effectNodeMap);

    effectNodeMap.forEach((isNewlyMounted, node) => {
        mountEffectsOnFunctionalVirtualNode(node, isNewlyMounted);
    });
}

const _performUnitOfWork = (current, root, mountNodesMap) => {
    reconcileChildren(current);

    if (current === root) {
        destroyEffectsOnFunctionalVirtualNode(current, false);
        mountNodesMap.set(current, false);

    } else if (current.alternative_ !== null) {
        updateView(current, current.alternative_);
        if (isFunction(current.type_)) {
            destroyEffectsOnFunctionalVirtualNode(current.alternative_, false);
            mountNodesMap.set(current, false);
        }
        current.alternative_ = null;
        
    } else {
        insertView(current);
        if (isFunction(current.type_)) {
            mountNodesMap.set(current, true);
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            workLoop((deletedNode) => {
                if (isFunction(deletedNode.type_)) {
                    destroyEffectsOnFunctionalVirtualNode(deletedNode, true);
                }
            }, subtree, null);

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}
