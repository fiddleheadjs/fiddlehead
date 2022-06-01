import {isFunction} from './Util';
import {createVirtualNodeFromContent} from './CreateElement';
import {StateHook} from './StateHook';
import {prepareCurrentlyProcessing, flushCurrentlyProcessing} from './CurrentlyProcessing';
import {catchError} from './CatchError';

export const reconcileChildren = (current, isSubtreeRoot) => {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current, isSubtreeRoot);
    } else {
        _reconcileChildrenOfStaticNode(current);
    }
}

const _reconcileChildOfDynamicNode = (current, isSubtreeRoot) => {
    const oldChild = isSubtreeRoot ? current.child_ : (
        current.alternative_ !== null ? current.alternative_.child_ : null
    );

    let newContent;

    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
    } catch (error) {
        catchError(error, current);
        newContent = null;
    }
    flushCurrentlyProcessing();

    const newChild = createVirtualNodeFromContent(newContent);

    if (newChild !== null) {
        newChild.parent_ = current;
        newChild.slot_ = 0;
    }

    if (oldChild !== null) {
        if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }

    current.child_ = newChild;
}

const _reconcileChildrenOfStaticNode = (current) => {
    if (current.alternative_ === null) {
        return;
    }

    const oldChildren = _mapChildren(current.alternative_);
    const newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach((oldChild, mapKey) => {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    });
}

const _makeAlternative = (newChild, oldChild) => {
    newChild.alternative_ = oldChild;

    if (isFunction(newChild.type_)) {
        newChild.hook_ = oldChild.hook_;

        let hook = newChild.hook_;
        while (hook !== null) {
            if (hook instanceof StateHook) {
                hook.context_ = newChild;
            }
            hook = hook.next_;
        }
    }
}

const _addDeletion = (current, childToDelete) => {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
    }
}

const _mapChildren = (node) => {
    const map = new Map();
    let child = node.child_;
    while (child !== null) {
        if (child.key_ !== null) {
            map.set(child.key_, child);
        } else {
            map.set(child.slot_, child);
        }
        child = child.sibling_;
    }
    return map;
}
