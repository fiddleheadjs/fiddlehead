let currentVNode = null;
let currentRefHook = null;
let currentStateHook = null;
let currentEffectHook = null;

export let prepareCurrentlyProcessing = (functionalVNode) => {
    currentVNode = functionalVNode;
};

export let flushCurrentlyProcessing = () => {
    currentVNode = null;
    currentRefHook = null;
    currentStateHook = null;
    currentEffectHook = null;
};

export let resolveRootVNode = () => {
    _throwIfCallInvalid();
    let vnode = currentVNode;
    while (vnode.parent_ !== null) {
        vnode = vnode.parent_;
    }
    return vnode;
};

export let resolveCurrentRefHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentRefHook = _resolveCurrentHookImpl(createHookFn, currentRefHook, currentVNode.refHook_);
    if (currentVNode.refHook_ === null) {
        currentVNode.refHook_ = currentRefHook;
    }
    return processFn(currentRefHook);
};

export let resolveCurrentStateHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentStateHook = _resolveCurrentHookImpl(createHookFn, currentStateHook, currentVNode.stateHook_);
    if (currentVNode.stateHook_ === null) {
        currentVNode.stateHook_ = currentStateHook;
    }
    return processFn(currentStateHook);
};

export let resolveCurrentEffectHook = (createHookFn, processFn) => {
    _throwIfCallInvalid();
    currentEffectHook = _resolveCurrentHookImpl(createHookFn, currentEffectHook, currentVNode.effectHook_);
    if (currentVNode.effectHook_ === null) {
        currentVNode.effectHook_ = currentEffectHook;
    }
    return processFn(currentEffectHook);
};

let _resolveCurrentHookImpl = (createHookFn, currentHook, firstHookOfNode) => {
    if (currentHook === null) {
        if (firstHookOfNode === null) {
            return createHookFn(currentVNode);
        } else {
            return firstHookOfNode;
        }
    } else {
        if (currentHook.next_ === null) {
            let nextHook = createHookFn(currentVNode);
            currentHook.next_ = nextHook;
            return nextHook;
        } else {
            return currentHook.next_;
        }
    }
};

let _throwIfCallInvalid = () => {
    if (currentVNode === null) {
        throw new ReferenceError('Hooks can only be called inside a component.');
    }
};
