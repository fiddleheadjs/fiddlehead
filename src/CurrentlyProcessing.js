let currentNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

export function prepareCurrentlyProcessing(functionalVirtualNode) {
    currentNode = functionalVirtualNode;
}

export function flushCurrentlyProcessing() {
    currentNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
}

export function resolveCurrentRefHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentNode.refHook_);
    if (currentNode.refHook_ === null) {
        currentNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
}

export function resolveCurrentStateHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentNode.stateHook_);
    if (currentNode.stateHook_ === null) {
        currentNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
}

export function resolveCurrentEffectHook(createHookFn, processFn) {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentNode.effectHook_);
    if (currentNode.effectHook_ === null) {
        currentNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
}

function _throwIfCallInvalid() {
    if (currentNode === null) {
        throw new Error('Cannot use hooks from outside of components');
    }
}

function _resolveCurrentHookImpl(createHookFn, currentHook, nodeFirstHook) {
    if (currentHook === null) {
        if (nodeFirstHook === null) {
            return createHookFn(currentNode);
        } else {
            return nodeFirstHook;
        }
    } else {
        if (currentHook.next_ === null) {
            const nextHook = createHookFn(currentNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
}
