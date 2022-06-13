// Find the virtual node in the parent chain which its native node is not null
/**
 * 
 * @param {VirtualNode} current 
 * @returns {Node}
 */
export function resolveMountingPoint(current) {
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
 * @param {VirtualNode} parent 
 * @param {VirtualNode} stopBefore 
 * @returns {void}
 */
export function walkNativeChildren(callback, parent, stopBefore) {
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
            continue;
        }
    }
}
