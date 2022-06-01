import {catchError} from './CatchError';
import {resolveCurrentHook} from './CurrentlyProcessing';
import {compareArrays} from './Util';

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {number} tag
 * @return {EffectHook}
 * @constructor
 */
export function EffectHook(callback, deps, tag) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.tag_ = tag;
    this.destroy_ = null;
    this.lastDestroy_ = null;
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
            return new EffectHook(callback, deps, effectTag);
        },
        (currentHook) => {
            if (__DEV__) {
                if (!(
                    deps === null && currentHook.deps_ === null ||
                    deps.length === currentHook.deps_.length
                )) {
                    throw new Error('Deps must be size-fixed');
                }
                // On the production, we accept the deps change its length
                // and consider it is changed
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
                currentHook.callback_ = callback;
                currentHook.deps_ = deps;
                currentHook.tag_ = effectTag;

                currentHook.lastDestroy_ = currentHook.destroy_;
                currentHook.destroy_ = null;
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
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, functionalVirtualNode);
                }
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
                    try {
                        _destroyEffect(hook, isNodeUnmounted);
                    } catch (error) {
                        catchError(error, functionalVirtualNode);
                    }
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
const _mountEffect = (effectHook) => {
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
const _destroyEffect = (hook, isNodeUnmounted) => {
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
    if (compareArrays(deps, lastDeps)) {
        return TAG_DEPS;
    }

    // DepsChanged
    {
        return TAG_DEPS_CHANGED;
    }
}
