import {resolveCurrentEffectHook} from './CurrentlyProcessing';
import {catchError} from './CatchError';
import {depsMismatch, warnIfDepsSizeChangedOnDEV} from './Dependencies';

export const EFFECT_NORMAL = 0;
export const EFFECT_LAYOUT = 1;

/**
 *
 * @param {number} tag
 * @constructor
 */
export function EffectHook(tag) {
    this.tag_ = tag;
    this.mount_ = undefined;
    this.deps_ = undefined;
    this.destroy_ = undefined;
    this.prevDeps_ = undefined;
    this.next_ = null;
}

export let useEffect = (mount, deps) => {
    return _useEffectImpl(EFFECT_NORMAL, mount, deps);
};

export let useLayoutEffect = (mount, deps) => {
    return _useEffectImpl(EFFECT_LAYOUT, mount, deps);
};

let _useEffectImpl = (tag, mount, deps) => {
    return resolveCurrentEffectHook(
        (currentVNode) => {
            return new EffectHook(tag);
        },
        (currentHook) => {
            warnIfDepsSizeChangedOnDEV(deps, currentHook.deps_);
            
            currentHook.mount_ = mount;
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
            // The mount callback can be undefined here if there is an action
            // in the rendering stack leads to an synchronous update request.
            // That update will be performed before the callback of the useEffect,
            // then schedule another call for the same callback
            if (hook.mount_ !== undefined) {
                if (isNewlyMounted || depsMismatch(hook.deps_, hook.prevDeps_)) {
                    // Update the previous deps
                    hook.prevDeps_ = hook.deps_;
                    hook.deps_ = undefined;
    
                    // Run the effect mount callback
                    try {
                        hook.destroy_ = hook.mount_();
                    } catch (error) {
                        catchError(error, vnode);
                    }

                    // Clear the mount callback to avoid duplicated calls,
                    // even if the call throws an error
                    hook.mount_ = undefined;
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
            // Check if the effect has a destroy callback
            if (hook.destroy_ !== undefined) {
                if (isUnmounted || depsMismatch(hook.deps_, hook.prevDeps_)) {
                    // Run the effect destroy callback
                    try {
                        hook.destroy_();
                    } catch (error) {
                        catchError(error, vnode);
                    }
    
                    // Clear the destroy callback to avoid duplicated calls,
                    // even if the call throws an error
                    hook.destroy_ = undefined;
                }
            }
        }
        hook = hook.next_;
    }
};
