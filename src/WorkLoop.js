// Algorithm: https://github.com/facebook/react/issues/7942

export function workLoop(performUnit, onReturn, root, ref_0, ref_1) {
    let current = root;
    while (true) {
        performUnit(current, root, ref_0, ref_1);
        if (current.child_ !== null) {
            current = current.child_;
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
            if (onReturn !== null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
}

export function queueWork(work) {
    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(work);
    } else {
        setTimeout(work);
    }
}
