const isFunction = (value) => {
    return typeof value === 'function';
}

export const reconcileChildren = (current) => {
    if (isFunction(current.type_)) {
        reconcileChildOfDynamicNode(current);
    } else {
        reconcileChildrenOfStaticNode(current);
    }
}

const reconcileChildOfDynamicNode = (current) => {
    const oldChild = (
        current.alternative_ !== null
            ? current.alternative_.child_
            : current.child_
    );

    // prepare currently rendering
    const newChild = current.type_(current.props_);
    // flush currently rendering

    current.child_ = newChild;

    if (newChild !== null) {
        newChild.parent_ = current;
    }

    if (newChild === null && oldChild !== null) {
        addDeletion(current, oldChild);
    }
    else if (newChild !== null && oldChild !== null) {
        // if the same
        if (newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            makeAlternative(newChild, oldChild);
        } else {
            addDeletion(current, oldChild);
        }
    }
}

const reconcileChildrenOfStaticNode = (current) => {
    if (current.alternative_ === null) {
        return;
    }

    const oldChildren = mapChildren(current.alternative_);
    const newChildren = mapChildren(current);

    let newChild;
    oldChildren.forEach((oldChild, mapKey) => {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            makeAlternative(newChild, oldChild);
        } else {
            addDeletion(current, oldChild);
        }
    });
}

const makeAlternative = (newChild, oldChild) => {
    newChild.alternative_ = oldChild;
    if (isFunction(newChild.type_)) {
        newChild.hooks_ = oldChild.hooks_;
        // update (<StateHook> hook).context_ = newChild
    }
}

const addDeletion = (current, deletedChild) => {
    if (current.deletions_ === null) {
        current.deletions_ = [deletedChild];
    } else {
        current.deletions_.push(deletedChild);
    }
}

const mapChildren = (node) => {
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
