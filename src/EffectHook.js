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

const EFFECT_ALWAYS = 0;
const EFFECT_LAZY = 1;
const EFFECT_DEPS = 2;
const EFFECT_DEPS_CHANGED = 3;

export function useEffect(callback, deps) {
    if (deps === undefined) {
        deps = null;
    }

    return resolveCurrentHook(
        function (currentNode) {
            const effectTag = _determineEffectTag(deps, null);
            return new EffectHook(callback, deps, effectTag);
        },
        function (currentHook) {
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

            if (effectTag === EFFECT_LAZY) {
                return;
            }
    
            if (effectTag === EFFECT_DEPS) {
                currentHook.tag_ = effectTag;
                return;
            }
    
            if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
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
 * @param {boolean} isNewlyMounted
 */
export function mountEffects(functionalVirtualNode, isNewlyMounted) {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (isNewlyMounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
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
 * @param {boolean} isUnmounted
 */
export function destroyEffects(functionalVirtualNode, isUnmounted) {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
                    try {
                        _destroyEffect(hook, isUnmounted);
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
function _mountEffect(effectHook) {
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
function _destroyEffect(hook, isNodeUnmounted) {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
}

/**
 * 
 * @param {[]|null} deps 
 * @param {[]|null} lastDeps 
 * @returns 
 */
function _determineEffectTag(deps, lastDeps) {
    // Always
    if (deps === null) {
        return EFFECT_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return EFFECT_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return EFFECT_DEPS;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
}
