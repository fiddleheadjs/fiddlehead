import {resolveCurrentEffectHook} from './CurrentlyProcessing';
import {catchError} from './CatchError';
import {compareArrays} from './Util';

export const EFFECT_NORMAL = 0;
export const EFFECT_LAYOUT = 1;

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
    this.destroy_ = null;
    this.lastDeps_ = null;
    this.lastDestroy_ = null;
    this.tag_ = tag;
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
            return new EffectHook(callback, deps, tag);
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

            currentHook.callback_ = callback;
            currentHook.deps_ = deps;
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
    let hook = virtualNode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (isNewlyMounted || !_matchDeps(hook.deps_, hook.lastDeps_)) {
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
                if (isUnmounted || !_matchDeps(hook.deps_, hook.lastDeps_)) {
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
    hook.lastDeps_ = hook.deps_;
    hook.lastDestroy_ = hook.destroy_;
    
    hook.destroy_ = hook.callback_();
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
function _matchDeps(deps, lastDeps) {
    // Always
    if (deps === null) {
        return false;
    }

    // Lazy
    if (deps.length === 0) {
        return true;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return true;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return true;
    }

    // DepsChanged
    {
        return false;
    }
}
