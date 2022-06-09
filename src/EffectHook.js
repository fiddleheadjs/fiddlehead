import {resolveCurrentEffectHook} from './CurrentlyProcessing';
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
    this.pendingDeps_ = null;
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

    return resolveCurrentEffectHook(
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
    
            // const flag = _determineFlag(deps, currentHook.deps_);

            // if (flag === FLAG_LAZY) {
            //     currentHook.pendingDeps_ = deps;
            //     return;
            // }
    
            // if (flag === FLAG_DEPS) {
                // currentHook.flag_ = flag;
                currentHook.pendingDeps_ = deps;
            //     return;
            // }
    
            // if (flag === FLAG_ALWAYS) {
            //     currentHook.callback_ = callback;
            //     // currentHook.deps_ = deps;
            //     currentHook.flag_ = flag;

            //     currentHook.lastDestroy_ = currentHook.destroy_;
            //     currentHook.destroy_ = null;
            //     return;
            // }
        }
    );
}

/**
 *
 * @param {number} effectTag
 * @param {VirtualNode} virtualNode
 * @param {boolean} isNewlyMounted
 */
export function mountEffects(effectTag, virtualNode, isNewlyMounted) {
    if (effectTag === EFFECT_NORMAL) {
        console.log('--', virtualNode.type_.name, 'mountEffects');
    }
    let hook = virtualNode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {

            const flag = _determineFlag(hook.deps_, hook.pendingDeps_);
            if (isNewlyMounted || flag === FLAG_ALWAYS || flag === FLAG_DEPS_CHANGED) {
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, virtualNode);
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 * @param {number} effectTag
 * @param {VirtualNode} virtualNode
 * @param {boolean} isUnmounted
 */
export function destroyEffects(effectTag, virtualNode, isUnmounted) {
    let hook = virtualNode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                const flag = _determineFlag(hook.deps_, hook.pendingDeps_);
                if (isUnmounted || flag === FLAG_ALWAYS || flag === FLAG_DEPS_CHANGED) {
                    try {
                        _destroyEffect(hook, isUnmounted);
                    } catch (error) {
                        catchError(error, virtualNode);
                    }
                }
            }
        }
        hook = hook.next_;
    }
}

/**
 *
 * @param {EffectHook} hook
 */
function _mountEffect(hook) {
    hook.destroy_ = hook.callback_();
    hook.deps_ = hook.pendingDeps_;

    if (hook.destroy_ === undefined) {
        hook.destroy_ = null;
    }
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isUnmounted
 */
function _destroyEffect(hook, isUnmounted) {
    hook.deps_ = hook.pendingDeps_;

    if (hook.lastDestroy_ !== null && !isUnmounted) {
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
