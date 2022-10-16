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
        if (hook.tag_ === effectTag && hook.mount_ !== undefined) {
            if (isNewlyMounted || depsMismatch(hook.deps_, hook.prevDeps_)) {
                // Save the previous deps
                hook.prevDeps_ = hook.deps_;
                hook.deps_ = undefined;

                // Run the effect mount
                try {
                    hook.destroy_ = hook.mount_();
                    hook.mount_ = undefined;
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
        if (hook.tag_ === effectTag && hook.destroy_ !== undefined) {
            if (isUnmounted || depsMismatch(hook.deps_, hook.prevDeps_)) {
                try {
                    hook.destroy_();
                    hook.destroy_ = undefined;
                } catch (error) {
                    catchError(error, vnode);
                }
            }
        }
        hook = hook.next_;
    }
};
