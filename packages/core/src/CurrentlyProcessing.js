let currentVNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

export const prepareCurrentlyProcessing = (functionalVNode) => {
    currentVNode = functionalVNode;
}

export const flushCurrentlyProcessing = () => {
    currentVNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
}

export const resolveCurrentRefHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentVNode.refHook_);
    if (currentVNode.refHook_ === null) {
        currentVNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
}

export const resolveCurrentStateHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentVNode.stateHook_);
    if (currentVNode.stateHook_ === null) {
        currentVNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
}

export const resolveCurrentEffectHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentVNode.effectHook_);
    if (currentVNode.effectHook_ === null) {
        currentVNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
}

const _resolveCurrentHookImpl = (createHookFn, currentHook, firstHookOfNode) => {
    if (currentHook === null) {
        if (firstHookOfNode === null) {
            return createHookFn(currentVNode);
        } else {
            return firstHookOfNode;
        }
    } else {
        if (currentHook.next_ === null) {
            const nextHook = createHookFn(currentVNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
}

const _throwIfCallInvalid = () => {
    if (currentVNode === null) {
        throw new Error('Cannot use hooks from outside of components');
    }
}
