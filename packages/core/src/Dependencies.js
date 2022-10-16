import {arraysShallowEqual} from './Util';

/**
 * 
 * @param {[]|undefined} deps 
 * @param {[]|undefined} lastDeps 
 * @returns {boolean}
 */
 export let depsMismatch = (deps, lastDeps) => {
    // Always
    if (deps === undefined) {
        return true;
    }
    
    // First time
    if (lastDeps === undefined) {
        return true;
    }

    // Lazy
    if (deps.length === 0) {
        return false;
    }

    // Two arrays are equal
    if (arraysShallowEqual(deps, lastDeps)) {
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
 * @param {[]|undefined} lastDeps 
 * @returns {boolean}
 */
export let warnIfDepsSizeChangedOnDEV = (deps, lastDeps) => {
    if (__DEV__) {
        if (!(
            deps === undefined && lastDeps === undefined ||
            deps !== undefined && lastDeps === undefined ||
            deps !== undefined && lastDeps !== undefined && deps.length === lastDeps.length
        )) {
            throw new Error('Deps must be size-fixed');
        }
        // On the production, we accept the deps change its length
        // and consider it is changed
    }
};
