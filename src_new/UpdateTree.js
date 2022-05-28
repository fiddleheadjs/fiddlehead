import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {isFunction} from './Util';

export const updateTree = (current) => {
    const mountNodesMap = new Map();
    _walk(_performUnitOfWork, _mountEffects, mountNodesMap, current, current);
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
            _walk((deletedNode) => {
                if (isFunction(deletedNode.type_)) {
                    destroyEffectsOnFunctionalVirtualNode(deletedNode, true);
                }
            }, null, null, subtree, subtree);

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}

const _mountEffects = (mountNodesMap) => {
    mountNodesMap.forEach((isNewlyMounted, node) => {
        mountEffectsOnFunctionalVirtualNode(node, isNewlyMounted);
    });
};

const _walk = (performUnit, onFinish, data, root, current, isUncleOfLastPerformedUnit = false) => {
    if (!isUncleOfLastPerformedUnit) {
        performUnit(current, root, data);

        if (current.child_ !== null) {
            _walk(performUnit, onFinish, data, root, current.child_);
            return;
        }
        
        if (current.sibling_ !== null) {
            _walk(performUnit, onFinish, data, root, current.sibling_);
            return;
        }
    } else {
        if (current.sibling_ !== null) {
            _walk(performUnit, onFinish, data, root, current.sibling_);
            return;
        }
    }

    // Stop if the current is the root
    // in case, the root has no children
    if (current !== root) {
        // Stop if the parent is the root
        if (current.parent_ !== root) {
            _walk(performUnit, onFinish, data, root, current.parent_, true);
            return;
        }
    }

    // The end of the work loop
    if (onFinish !== null) {
        onFinish(data);
    }
}
