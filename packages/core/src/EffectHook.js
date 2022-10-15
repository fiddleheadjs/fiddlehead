import {resolveCurrentEffectHook} from './CurrentlyProcessing';
import {catchError} from './CatchError';
import {depsMismatch, warnIfDepsSizeChangedOnDEV} from './Dependencies';

export const EFFECT_NORMAL = 0;
export const EFFECT_LAYOUT = 1;

/**
 *
 * @param {number} tag
 * @param {function} callback
 * @param {[]|undefined} deps
 * @constructor
 */
export function EffectHook(tag, callback, deps) {
    this.tag_ = tag;
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = undefined;
    this.lastDeps_ = undefined;
    this.next_ = null;
}

export let useEffect = (callback, deps) => {
    return _useEffectImpl(EFFECT_NORMAL, callback, deps);
};

export let useLayoutEffect = (callback, deps) => {
    return _useEffectImpl(EFFECT_LAYOUT, callback, deps);
};

let _useEffectImpl = (tag, callback, deps) => {
    return resolveCurrentEffectHook(
        (currentVNode) => {
            return new EffectHook(tag, callback, deps);
        },
        (currentHook) => {
            warnIfDepsSizeChangedOnDEV(deps, currentHook.deps_);
            
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
            if (isNewlyMounted || depsMismatch(hook.deps_, hook.lastDeps_)) {
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
            if (hook.destroy_ !== undefined) {
                if (isUnmounted || depsMismatch(hook.deps_, hook.lastDeps_)) {
                    try {
                        hook.destroy_();
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
    // Save the last deps for the next time
    hook.lastDeps_ = hook.deps_;
    
    // Run the effect callback
    hook.destroy_ = hook.callback_();
};
