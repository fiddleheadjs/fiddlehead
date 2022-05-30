import {processCurrentHook} from './CurrentlyProcessing';

/**
 *
 * @param {*} current
 * @constructor
 */
export function RefHook(current) {
    this.current = current;
    this.next_ = null;
}

export const useRef = (initialValue) => {
    return processCurrentHook(
        (currentNode) => new RefHook(initialValue),
        (currentHook) => currentHook
    );
}
