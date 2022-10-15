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
 * @param {[]|undefined} depsA 
 * @param {[]|undefined} depsB 
 * @returns {boolean}
 */
export let warnIfDepsSizeChangedOnDEV = (depsA, depsB) => {
    if (__DEV__) {
        if (!(
            depsA === undefined && depsB === undefined ||
            depsA.length === depsB.length
        )) {
            throw new Error('Deps must be size-fixed');
        }
        // On the production, we accept the deps change its length
        // and consider it is changed
    }
};
