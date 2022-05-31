import {catchError} from './CatchError';
import {resolveCurrentHook} from './CurrentlyProcessing';
import {resolveTree} from './ResolveTree';
import {isFunction} from './Util';

export const STATE_NORMAL = 0;
export const STATE_ERROR = 1;

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @param {number} tag
 * @constructor
 */
export function StateHook(context, initialValue, tag) {
    this.context_ = context;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    this.tag_ = tag;
    this.next_ = null;
}

export const useState = (initialValue) => {
    return resolveCurrentHook(
        (currentNode) => new StateHook(currentNode, initialValue, STATE_NORMAL),
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
}

export const useError = (initialError) => {
    return resolveCurrentHook(
        (currentNode) => {
            if (!_validateError(initialError)) {
                // If the initial error is invalid,
                // use null instead
                initialError = null;
            }
            return new StateHook(currentNode, initialError, STATE_ERROR);
        },
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
}

const queueMap = new Map();
let timeoutId = null;

export function _setState(value) {
    let queue = queueMap.get(this.context_);

    if (queue === undefined) {
        queue = [[value, this]];
        queueMap.set(this.context_, queue);
    } else {
        queue.unshift([value, this]);
    }

    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(_flushQueues);
}

const _flushQueues = () => {
    queueMap.forEach((queue, context) => {
        let value, hook, hasChanges = false;
        
        while (queue.length > 0) {
            [value, hook] = queue.pop();

            let newValue;
            
            if (isFunction(value)) {
                try {
                    newValue = value(hook.value_);
                } catch (error) {
                    catchError(error, context);
                    continue;
                }
            } else {
                newValue = value;
            }

            if (hook.tag_ === STATE_ERROR && !_validateError(newValue)) {
                // If the new error is invalid,
                // keep the current error unchanged
                continue;
            }
            
            if (newValue !== hook.value_) {
                hook.value_ = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resolveTree(context);
        }
    });

    queueMap.clear();
    timeoutId = null;
}

const _validateError = (error) => {
    if (!(error === null || error instanceof Error)) {
        if (__DEV__) {
            console.error('Error hooks only accept the value is an instance of Error or null');
        }
        return false;
    }

    return true;
}
