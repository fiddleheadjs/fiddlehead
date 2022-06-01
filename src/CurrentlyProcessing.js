let currentNode = null;
let currentHook = null;

export function prepareCurrentlyProcessing(functionalVirtualNode) {
    currentNode = functionalVirtualNode;
}

export function flushCurrentlyProcessing() {
    currentNode = null;
    currentHook = null;
}

export function resolveCurrentHook(createHookFn, processFn) {
    if (currentNode === null) {
        throw new Error('Cannot use hooks from outside of components');
    }
    
    if (currentHook === null) {
        if (currentNode.hook_ === null) {
            currentHook = createHookFn(currentNode);
            currentNode.hook_ = currentHook;
        } else {
            currentHook = currentNode.hook_;
        }
    } else {
        if (currentHook.next_ === null) {
            const previousHook = currentHook;           
            currentHook = createHookFn(currentNode);
            previousHook.next_ = currentHook;
        } else {
            currentHook = currentHook.next_;
        }
    }

    return processFn(currentHook);
}
