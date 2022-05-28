import {isFunction} from './Util';
import {createVirtualNodeFromContent} from './VirtualNode';
import {StateHook} from './StateHook';
import {prepareCurrentlyProcessing, flushCurrentlyProcessing} from './CurrentlyProcessing';

export const reconcileChildren = (current) => {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current);
    } else {
        _reconcileChildrenOfStaticNode(current);
    }
}

const _reconcileChildOfDynamicNode = (current) => {
    const oldChild = (
        current.alternative_ !== null
            ? current.alternative_.child_
            : current.child_
    );

    prepareCurrentlyProcessing(current);
    const newChild = createVirtualNodeFromContent(
        current.type_(current.props_)
    );
    flushCurrentlyProcessing();

    current.child_ = newChild;

    if (newChild !== null) {
        newChild.parent_ = current;
    }

    if (newChild === null && oldChild !== null) {
        _addDeletion(current, oldChild);
    }
    else if (newChild !== null && oldChild !== null) {
        // If the same
        if (newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }
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
        newChild.hooks_ = oldChild.hooks_;

        for (
            let hook, i = 0, len = newChild.hooks_.length
            ; i < len
            ; ++i
        ) {
            hook = newChild.hooks_[i];

            if (hook instanceof StateHook) {
                hook.context_ = newChild;
            }
        }
    }
}

const _addDeletion = (current, deletedChild) => {
    if (current.deletions_ === null) {
        current.deletions_ = [deletedChild];
    } else {
        current.deletions_.push(deletedChild);
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
