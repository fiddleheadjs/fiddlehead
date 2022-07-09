// The mounting point is a virtual node which has a native node (not null)
// It means that a mounting point can contains native children
/**
 * 
 * @param {VNode} current 
 * @returns {VNode}
 */
export let resolveMountingPoint = (current) => {
    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current;
        }
        current = current.parent_;
    }
}

// Walk through native children of a parent
/**
 * 
 * @param {function} callback 
 * @param {VNode} parent 
 * @param {VNode?} stopBefore
 * @returns {void}
 */
export let walkNativeChildren = (callback, parent, stopBefore) => {
    let current = parent.child_;
    if (current !== null) {
        while (true) {
            if (current === stopBefore) {
                return;
            }
            if (current.nativeNode_ !== null) {
                callback(current.nativeNode_);
            } else if (current.child_ !== null) {
                current = current.child_;
                continue;
            }
            if (current === parent) {
                return;
            }
            while (current.sibling_ === null) {
                if (current.parent_ === null || current.parent_ === parent) {
                    return;
                }
                current = current.parent_;
            }
            current = current.sibling_;
        }
    }
}
