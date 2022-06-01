import {resolveCurrentlyProcessing} from './CurrentlyProcessing';
import {compareSameLengthArrays} from './Util';

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {function} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
export function EffectHook(callback, deps, lastDestroy) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDestroy_ = lastDestroy;
    this.tag_ = null;
}

const TAG_ALWAYS = 0;
const TAG_LAZY = 1;
const TAG_DEPS = 2;
const TAG_DEPS_CHANGED = 3;

export const useEffect = (callback, deps = null) => {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = functionalVirtualNode.hooks_[hookIndex];

        if (__DEV__) {
            if (!(
                deps === null && currentHook.deps_ === null ||
                deps.length === currentHook.deps_.length
            )) {
                throw new Error('Deps must be size-fixed');
            }
        }

        const effectTag = _getEffectTag(deps, currentHook.deps_);

        if (effectTag === TAG_LAZY) {
            return;
        }

        if (effectTag === TAG_DEPS) {
            currentHook.tag_ = effectTag;
            return;
        }

        if (effectTag === TAG_ALWAYS || effectTag === TAG_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy_);
            newHook.tag_ = effectTag;
            functionalVirtualNode.hooks_[hookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps, null);
    hook.tag_ = _getEffectTag(deps, null);

    functionalVirtualNode.hooks_.push(hook);
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
export const mountEffectsOnFunctionalVirtualNode = (functionalVirtualNode, isNewNodeMounted) => {
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

        if (!(hook instanceof EffectHook)) {
            continue;
        }

        if (isNewNodeMounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
            _mountEffectHook(hook);
        }
    }
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
export const destroyEffectsOnFunctionalVirtualNode = (functionalVirtualNode, isNodeUnmounted) => {
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy_ !== null || hook.destroy_ !== null)
        )) {
            continue;
        }

        if (isNodeUnmounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
            _destroyEffectHook(hook, isNodeUnmounted);
        }
    }
}

/**
 *
 * @param {EffectHook} effectHook
 */
const _mountEffectHook = (effectHook) => {
    effectHook.destroy_ = effectHook.callback_();

    if (effectHook.destroy_ === undefined) {
        effectHook.destroy_ = null;
    }
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
const _destroyEffectHook = (hook, isNodeUnmounted) => {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
}

const _getEffectTag = (deps, lastDeps) => {
    // Always
    if (deps === null) {
        return TAG_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return TAG_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return TAG_DEPS;
    }
    // 2. Two arrays are equal
    if (compareSameLengthArrays(deps, lastDeps)) {
        return TAG_DEPS;
    }

    // DepsChanged
    {
        return TAG_DEPS_CHANGED;
    }
}
