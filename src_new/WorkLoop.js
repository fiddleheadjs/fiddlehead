import {insertView, updateView, deleteView} from './CommitView';
import {reconcileChildren} from './Reconciliation';

const SubtreeRoot = 0;
const ChildrenDirection = 1;
const UncleDirection = 2;

export const updateSubtree = (current, direction = SubtreeRoot) => {
    requestAnimationFrame(() => {
        if (direction === SubtreeRoot || direction === ChildrenDirection) {
            _performUnitOfWork(current, direction);
    
            if (current.child_ !== null) {
                updateSubtree(current.child_, ChildrenDirection);
                return;
            }
    
            if (current.sibling_ !== null) {
                updateSubtree(current.sibling_, ChildrenDirection);
                return;
            }
        } else if (direction === UncleDirection) {
            if (current.sibling_ !== null) {
                updateSubtree(current.sibling_, ChildrenDirection);
                return;
            }
        }
    
        if (current.parent_ !== null) {
            updateSubtree(current.parent_, UncleDirection);
        }
    });
}

const _performUnitOfWork = (current, direction) => {
    reconcileChildren(current);

    if (direction !== SubtreeRoot) {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            current.alternative_ = null;
        } else {
            insertView(current);
            // mountEffects(current);
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            // unmountEffects(subtree);
            deleteView(subtree);
        });
        current.deletions_ = null;
    }
}
