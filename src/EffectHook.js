import {resolveCurrentlyProcessing} from './CurrentlyProcessing';

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {function} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
export function EffectHook(callback, deps, lastDestroy) {
    this.tag_ = EFFECT_NONE;
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDestroy_ = lastDestroy;
}

const EFFECT_NONE = 0;
const EFFECT_ALWAYS = 1;
const EFFECT_LAZY = 2;
const EFFECT_DEPS = 3;
const EFFECT_DEPS_CHANGED = 4;

export function useEffect(callback, deps = null) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = functionalVirtualNode.hooks_[hookIndex];

        if (!(
            deps === null && currentHook.deps_ === null ||
            deps.length === currentHook.deps_.length
        )) {
            throw new Error('Deps must be size-fixed');
        }

        const effectTag = _getEffectTag(deps, currentHook.deps_);

        if (effectTag === EFFECT_LAZY) {
            return;
        }

        if (effectTag === EFFECT_DEPS) {
            currentHook.tag_ = effectTag;
            return;
        }

        if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy_);
            newHook.tag_ = effectTag;
            functionalVirtualNode.hooks_[hookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps, null);
    hook.tag_ = _getEffectTag(deps);

    functionalVirtualNode.hooks_.push(hook);
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
export function mountEffectsOnFunctionalVirtualNode(functionalVirtualNode, isNewNodeMounted) {
    for (let i = 0; i < functionalVirtualNode.hooks_.length; i++) {
        const hook = functionalVirtualNode.hooks_[i];

        if (!(hook instanceof EffectHook)) {
            continue;
        }

        if (isNewNodeMounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
            _mountEffectHook(hook);
        }
    }
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
export function destroyEffectsOnFunctionalVirtualNode(functionalVirtualNode, isNodeUnmounted) {
    for (let i = 0; i < functionalVirtualNode.hooks_.length; i++) {
        const hook = functionalVirtualNode.hooks_[i];

        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy_ !== null || hook.destroy_ !== null)
        )) {
            continue;
        }

        if (isNodeUnmounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
            _destroyEffectHook(hook, isNodeUnmounted);
        }
    }
}

/**
 *
 * @param {EffectHook} effectHook
 */
function _mountEffectHook(effectHook) {
    effectHook.destroy_ = effectHook.callback_();
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
function _destroyEffectHook(hook, isNodeUnmounted = false) {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
}

function _getEffectTag(deps, lastDeps = false) {
    // Always
    if (deps === null) {
        return EFFECT_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return EFFECT_LAZY;
    }

    // Deps
    if (lastDeps === false || _compareSameLengthArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
}

function _compareSameLengthArrays(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
