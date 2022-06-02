import {resolveCurrentHook} from './CurrentlyProcessing';

/**
 *
 * @param {*} current
 * @constructor
 */
 export function Ref(current) {
    this.current = current;
}

/**
 *
 * @param {*} current
 * @constructor
 */
export function RefHook(current) {
    this.ref_ = new Ref(current);
    this.next_ = null;
}

/**
 *
 * @param {*} initialValue
 * @constructor
 */
export function useRef(initialValue) {
    return resolveCurrentHook(
        function (currentNode) {
            return new RefHook(initialValue);
        },
        function (currentHook) {
            return currentHook.ref_;
        }
    );
}
