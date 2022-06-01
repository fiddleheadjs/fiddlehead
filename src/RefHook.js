import {resolveCurrentHook} from './CurrentlyProcessing';

/**
 *
 * @param {*} current
 * @constructor
 */
export function RefHook(current) {
    this.current = current;
    this.next_ = null;
}

export function useRef(initialValue) {
    return resolveCurrentHook(
        function (currentNode) {
            return new RefHook(initialValue);
        },
        function (currentHook) {
            return currentHook;
        }
    );
}
