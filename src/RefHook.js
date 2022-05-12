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

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        return functionalVirtualNode.hooks_[hookIndex];
    }

    const hook = new RefHook(initialValue);

    functionalVirtualNode.hooks_.push(hook);

    return hook;
}
