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
 export let createRef = (initialValue) => {
    return new Ref(initialValue);
}

/**
 *
 * @param {any} initialValue
 */
export let useRef = (initialValue) => {
    return resolveCurrentRefHook(
        (currentVNode) => {
            return new RefHook(initialValue);
        },
        (currentHook) => {
            return currentHook.ref_;
        }
    );
}
