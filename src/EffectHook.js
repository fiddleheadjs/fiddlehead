import {resolveCurrentHook} from './CurrentlyProcessing';
import {catchError} from './CatchError';
import {compareArrays} from './Util';

export const EFFECT_NORMAL = 0;
export const EFFECT_LAYOUT = 1;

const FLAG_ALWAYS = 0;
const FLAG_LAZY = 1;
const FLAG_DEPS = 2;
const FLAG_DEPS_CHANGED = 3;

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {number} tag
 * @param {number} flag
 * @return {EffectHook}
 * @constructor
 */
export function EffectHook(callback, deps, tag, flag) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.tag_ = tag;
    this.flag_ = flag;
    this.destroy_ = null;
    this.lastDestroy_ = null;
    this.next_ = null;
}

export function useEffect(callback, deps) {
    return _useEffectImpl(callback, deps, EFFECT_NORMAL);
}

export function useLayoutEffect(callback, deps) {
    return _useEffectImpl(callback, deps, EFFECT_LAYOUT);
}

function _useEffectImpl(callback, deps, tag) {
    if (deps === undefined) {
        deps = null;
    }

    return resolveCurrentHook(
        function (currentNode) {
            const flag = _determineFlag(deps, null);
            return new EffectHook(callback, deps, tag, flag);
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
    
            const flag = _determineFlag(deps, currentHook.deps_);

            if (flag === FLAG_LAZY) {
                return;
            }
    
            if (flag === FLAG_DEPS) {
                currentHook.flag_ = flag;
                return;
            }
    
            if (flag === FLAG_ALWAYS || flag === FLAG_DEPS_CHANGED) {
                currentHook.callback_ = callback;
                currentHook.deps_ = deps;
                currentHook.flag_ = flag;

                currentHook.lastDestroy_ = currentHook.destroy_;
                currentHook.destroy_ = null;
                return;
            }
        }
    );
}

/**
 *
 * @param {number} effectTag
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewlyMounted
 */
export function mountEffects(effectTag, functionalVirtualNode, isNewlyMounted) {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook && hook.tag_ === effectTag) {
            if (isNewlyMounted || hook.flag_ === FLAG_ALWAYS || hook.flag_ === FLAG_DEPS_CHANGED) {
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
 * @param {number} effectTag
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isUnmounted
 */
export function destroyEffects(effectTag, functionalVirtualNode, isUnmounted) {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook && hook.tag_ === effectTag) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || hook.flag_ === FLAG_ALWAYS || hook.flag_ === FLAG_DEPS_CHANGED) {
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
function _determineFlag(deps, lastDeps) {
    // Always
    if (deps === null) {
        return FLAG_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return FLAG_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return FLAG_DEPS;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return FLAG_DEPS;
    }

    // DepsChanged
    {
        return FLAG_DEPS_CHANGED;
    }
}
