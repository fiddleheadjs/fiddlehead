import {resolveCurrentEffectHook} from './CurrentlyProcessing';
import {catchError} from './CatchError';
import {compareArrays} from './Util';

export const EFFECT_NORMAL = 0;
export const EFFECT_LAYOUT = 1;

/**
 *
 * @param {number} tag
 * @param {function} callback
 * @param {[]|null} deps
 * @constructor
 */
export function EffectHook(tag, callback, deps) {
    this.tag_ = tag;
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDeps_ = null;
    this.lastDestroy_ = null;
    this.next_ = null;
}

export let useEffect = (callback, deps) => {
    return _useEffectImpl(EFFECT_NORMAL, callback, deps);
};

export let useLayoutEffect = (callback, deps) => {
    return _useEffectImpl(EFFECT_LAYOUT, callback, deps);
};

let _useEffectImpl = (tag, callback, deps) => {
    if (deps === undefined) {
        deps = null;
    }

    return resolveCurrentEffectHook(
        (currentVNode) => {
            return new EffectHook(tag, callback, deps);
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

            currentHook.callback_ = callback;
            currentHook.deps_ = deps;
        }
    );
};

/**
 *
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isNewlyMounted
 */
export let mountEffects = (effectTag, vnode, isNewlyMounted) => {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (isNewlyMounted || _mismatchDeps(hook.deps_, hook.lastDeps_)) {
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, vnode);
                }
            }
        }
        hook = hook.next_;
    }
};

/**
 * @param {number} effectTag
 * @param {VNode} vnode
 * @param {boolean} isUnmounted
 */
export let destroyEffects = (effectTag, vnode, isUnmounted) => {
    let hook = vnode.effectHook_;
    while (hook !== null) {
        if (hook.tag_ === effectTag) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || _mismatchDeps(hook.deps_, hook.lastDeps_)) {
                    try {
                        _destroyEffect(hook, isUnmounted);
                    } catch (error) {
                        catchError(error, vnode);
                    }
                }
            }
        }
        hook = hook.next_;
    }
};

/**
 *
 * @param {EffectHook} hook
 */
let _mountEffect = (hook) => {
    // Save the last ones for the next time
    hook.lastDeps_ = hook.deps_;
    hook.lastDestroy_ = hook.destroy_;
    
    // Run effect callback
    hook.destroy_ = hook.callback_();
    if (hook.destroy_ === undefined) {
        hook.destroy_ = null;
    }
};

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isUnmounted
 */
let _destroyEffect = (hook, isUnmounted) => {
    if (hook.lastDestroy_ !== null && !isUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
};

/**
 * 
 * @param {[]|null} deps 
 * @param {[]|null} lastDeps 
 * @returns {boolean}
 */
let _mismatchDeps = (deps, lastDeps) => {
    // Always
    if (deps === null) {
        return true;
    }

    // Lazy
    if (deps.length === 0) {
        return false;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return false;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return false;
    }

    // DepsChanged
    {
        return true;
    }
};
