import {resolveCurrentHook} from './CurrentlyProcessing';
import {compareSameLengthArrays} from './Util';

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {function} lastDestroy
 * @param {number} tag
 * @return {EffectHook}
 * @constructor
 */
export function EffectHook(callback, deps, lastDestroy, tag) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDestroy_ = lastDestroy;
    this.tag_ = tag;
    this.next_ = null;
}

const TAG_ALWAYS = 0;
const TAG_LAZY = 1;
const TAG_DEPS = 2;
const TAG_DEPS_CHANGED = 3;

export const useEffect = (callback, deps = null) => {
    return resolveCurrentHook(
        (currentNode) => {
            const effectTag = _determineEffectTag(deps, null);
            return new EffectHook(callback, deps, null, effectTag);
        },
        (currentHook) => {
            if (__DEV__) {
                if (!(
                    deps === null && currentHook.deps_ === null ||
                    deps.length === currentHook.deps_.length
                )) {
                    throw new Error('Deps must be size-fixed');
                }
            }
    
            const effectTag = _determineEffectTag(deps, currentHook.deps_);
    
            if (effectTag === TAG_LAZY) {
                return;
            }
    
            if (effectTag === TAG_DEPS) {
                currentHook.tag_ = effectTag;
                return;
            }
    
            if (effectTag === TAG_ALWAYS || effectTag === TAG_DEPS_CHANGED) {
                EffectHook.call(currentHook, callback, deps, currentHook.destroy_, effectTag);
                return;
            }
        }
    );
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
export const mountEffects = (functionalVirtualNode, isNewNodeMounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (isNewNodeMounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
                _mountEffectHook(hook);
            }
        }

        hook = hook.next_;
    }
}

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
export const destroyEffects = (functionalVirtualNode, isNodeUnmounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isNodeUnmounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
                    _destroyEffectHook(hook, isNodeUnmounted);
                }
            }
        }

        hook = hook.next_;
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

const _determineEffectTag = (deps, lastDeps) => {
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
