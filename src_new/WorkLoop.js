import {insertView, updateView, deleteView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {reconcileChildren} from './Reconciliation';
import {isFunction} from './Util';

const SubtreeRoot = 0;
const ChildrenDirection = 1;
const UncleDirection = 2;

export const updateSubtree = (current, direction = SubtreeRoot) => {
    _walk(_performUnitOfWork, current, current, direction);
}

const _performUnitOfWork = (current, direction) => {
    reconcileChildren(current);

    if (direction !== SubtreeRoot) {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);

            if (isFunction(current.type_)) {
                destroyEffectsOnFunctionalVirtualNode(current.alternative_, false);
                mountEffectsOnFunctionalVirtualNode(current, false);
            }

            current.alternative_ = null;
        } else {
            insertView(current);
            
            if (isFunction(current.type_)) {
                mountEffectsOnFunctionalVirtualNode(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            _walk((deletedNode) => {
                if (isFunction(deletedNode.type_)) {
                    destroyEffectsOnFunctionalVirtualNode(deletedNode, true);
                }
            }, subtree, subtree, SubtreeRoot);

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}

const _walk = (callback, root, current, direction = SubtreeRoot) => {
    if (direction === SubtreeRoot || direction === ChildrenDirection) {
        callback(current, direction);

        if (current.child_ !== null) {
            _walk(callback, root, current.child_, ChildrenDirection);
            return;
        }

        if (current.sibling_ !== null) {
            _walk(callback, root, current.sibling_, ChildrenDirection);
            return;
        }
    } else if (direction === UncleDirection) {
        if (current.sibling_ !== null) {
            _walk(callback, root, current.sibling_, ChildrenDirection);
            return;
        }
    }

    // Stop if the current is the root
    // in case, the root has no children
    if (current !== root) {
        // Stop if the parent is the root
        if (current.parent_ !== root) {
            _walk(callback, root, current.parent_, UncleDirection);
        }
    }
}
