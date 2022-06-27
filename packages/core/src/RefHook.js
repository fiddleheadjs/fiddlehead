import {resolveCurrentRefHook} from './CurrentlyProcessing';

/**
 *
 * @param {any} current
 * @constructor
 */
 export function Ref(current) {
    this.current = current;
}

/**
 *
 * @param {any} current
 * @constructor
 */
export function RefHook(current) {
    this.ref_ = new Ref(current);
    this.next_ = null;
}

/**
 *
 * @param {any} initialValue
 */
export function useRef(initialValue) {
    return resolveCurrentRefHook(
        function (currentVNode) {
            return new RefHook(initialValue);
        },
        function (currentHook) {
            return currentHook.ref_;
        }
    );
}

/**
 *
 * @param {any} initialValue
 */
export function createRef(initialValue) {
    return new Ref(initialValue);
}
