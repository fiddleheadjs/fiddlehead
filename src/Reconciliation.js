import {isFunction} from './Util';
import {createVirtualNodeFromContent} from './CreateElement';
import {prepareCurrentlyProcessing, flushCurrentlyProcessing} from './CurrentlyProcessing';
import {catchError} from './CatchError';

export function reconcileChildren(current, isSubtreeRoot) {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current, current.alternate_, isSubtreeRoot);
    } else if (current.alternate_ !== null) {
        _reconcileChildrenOfStaticNode(current, current.alternate_);
    }
}

function _reconcileChildOfDynamicNode(current, alternate, isSubtreeRoot) {
    if (alternate !== null) {
        // Copy hooks
        current.refHook_ = alternate.refHook_;
        current.stateHook_ = alternate.stateHook_;
        current.effectHook_ = alternate.effectHook_;

        // Update contexts of state hooks
        let stateHook = current.stateHook_;
        while (stateHook !== null) {
            stateHook.context_ = current;
            stateHook = stateHook.next_;
        }
    }

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
        
        // Don't need to set the slot property
        // as a dynamic node can have only one child
    }

    const oldChild = isSubtreeRoot ? current.child_ : (
        alternate !== null ? alternate.child_ : null
    );
    
    if (oldChild !== null) {
        if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _markAlternate(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }
    
    current.child_ = newChild;
}

function _reconcileChildrenOfStaticNode(current, alternate) {
    const oldChildren = _mapChildren(alternate);
    const newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach(function (oldChild, mapKey) {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            _markAlternate(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    });
}

function _markAlternate(newChild, oldChild) {
    newChild.alternate_ = oldChild;
}

function _addDeletion(current, childToDelete) {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
    }
}

function _mapChildren(node) {
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
