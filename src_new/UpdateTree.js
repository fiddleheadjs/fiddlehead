import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {isFunction, queueWork} from './Util';
import {RootType} from './VirtualNode';

export const updateTree = (current) => {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, current, mountNodesMap, unmountNodesMap);

    queueWork(() => {
        mountNodesMap.forEach((isNewlyMounted, node) => {
            mountEffectsOnFunctionalVirtualNode(node, isNewlyMounted);
        });
        unmountNodesMap.forEach((isUnmounted, node) => {
            destroyEffectsOnFunctionalVirtualNode(node, isUnmounted);
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
