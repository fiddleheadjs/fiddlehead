import {resolveCurrentlyProcessing} from './CurrentlyProcessing';

/**
 *
 * @param {*} current
 * @constructor
 */
export function RefHook(current) {
    this.current = current;
}

export function useRef(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks.length > hookIndex) {
        return functionalVirtualNode.hooks[hookIndex];
    }

    const hook = new RefHook(initialValue);

    functionalVirtualNode.hooks.push(hook);

    return hook;
}
