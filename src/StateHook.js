import {catchError} from './CatchError';
import {resolveCurrentStateHook} from './CurrentlyProcessing';
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

export function useState(initialValue) {
    return resolveCurrentStateHook(
        function (currentNode) {
            return new StateHook(currentNode, initialValue, STATE_NORMAL);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

export function useError(initialError) {
    return resolveCurrentStateHook(
        function (currentNode) {
            // Make sure we have only one error hook in a component
            if (__DEV__) {
                let hook = currentNode.stateHook_;
                while (hook !== null) {
                    if (hook.tag_ === STATE_ERROR) {
                        console.error('A component accepts only one useError hook');
                    }
                    hook = hook.next_;
                }
            }

            // Make sure the initial error is valid
            if (!_validateError(initialError)) {
                // If the initial error is invalid,
                // use null instead
                initialError = null;
            }
            
            return new StateHook(currentNode, initialError, STATE_ERROR);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

const updateQueue = new Map();
let timeoutId = null;

export function _setState(value) {
    let newValue;

    if (isFunction(value)) {
        try {
            newValue = value(this.value_);
        } catch (error) {
            catchError(error, this.context_);
            return;
        }
    } else {
        newValue = value;
    }

    if (this.tag_ === STATE_ERROR && !_validateError(newValue)) {
        // If the new error is invalid,
        // keep the current error unchanged
        return;
    }

    if (this.value_ !== newValue) {
        // Set value synchronously
        this.value_ = newValue;

        // Enqueue update
        updateQueue.set(this.context_, this);

        // Reset timer
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(_flushQueues);
    }
}

function _flushQueues() {
    updateQueue.forEach(function (hook, contextAsKey) {
        // Important!!!
        // Use hook.context_ instead of contextAsKey
        // as it may be outdated due to the reconciliation process
        
        resolveTree(hook.context_);
    });

    updateQueue.clear();
    timeoutId = null;
}

function _validateError(error) {
    if (!(error === null || error instanceof Error)) {
        if (__DEV__) {
            console.error('Error hooks only accept the value is an instance of Error or null');
        }
        return false;
    }

    return true;
}
