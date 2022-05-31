// Algorithm: https://github.com/facebook/react/issues/7942

export const workLoop = (performUnit, onReturn, root, ...data) => {
    let current = root;
    while (true) {
        performUnit(current, root, ...data);
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

export const queueWork = (work) => {
    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(work);
    } else {
        setTimeout(work);
    }
}
