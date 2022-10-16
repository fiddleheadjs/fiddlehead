import {arraysShallowEqual} from './Util';

/**
 * 
 * @param {[]|undefined} deps 
 * @param {[]|undefined} prevDeps 
 * @returns {boolean}
 */
 export let depsMismatch = (deps, prevDeps) => {
    // Always
    if (deps === undefined) {
        return true;
    }
    
    // First time
    if (prevDeps === undefined) {
        return true;
    }

    // Lazy
    if (deps.length === 0) {
        return false;
    }

    // Two arrays are equal
    if (arraysShallowEqual(deps, prevDeps)) {
        return false;
    }

    // Deps changed
    {
        return true;
    }
};

/**
 * 
 * @param {[]|undefined} deps 
 * @param {[]|undefined} prevDeps 
 * @returns {boolean}
 */
export let warnIfDepsSizeChangedOnDEV = (deps, prevDeps) => {
    if (__DEV__) {
        if (!(
            deps === undefined && prevDeps === undefined ||
            deps !== undefined && prevDeps === undefined ||
            deps !== undefined && prevDeps !== undefined && deps.length === prevDeps.length
        )) {
            throw new Error('Deps must be size-fixed');
        }
        // On the production, we accept the deps change its length
        // and consider it is changed
    }
};
