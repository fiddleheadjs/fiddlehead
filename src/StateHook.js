import {catchError} from './CatchError';
import {resolveCurrentStateHook} from './CurrentlyProcessing';
import {renderTree} from './RenderTree';
import {isFunction} from './Util';

export const STATE_NORMAL = 0;
export const STATE_ERROR = 1;

/**
 *
 * @param {number} tag
 * @param {any} initialValue
 * @param {VirtualNode} context
 * @constructor
 */
export function StateHook(tag, initialValue, context) {
    this.tag_ = tag;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    this.context_ = context;
    this.next_ = null;
}

export function useState(initialValue) {
    return resolveCurrentStateHook(
        function (currentNode) {
            return new StateHook(STATE_NORMAL, initialValue, currentNode);
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
            
            return new StateHook(STATE_ERROR, initialError, currentNode);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

const pendingUpdates = new Map();
let timeoutId = null;

function _setState(value) {
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
        // We store the hook itself with the purpose of referring to
        // the up-to-date context when flushing updates.
        // So, we don't need to store all pending hooks inside a context.
        pendingUpdates.set(this.context_, this);

        // Reset timer
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(_flushUpdates);
    }
}

function _flushUpdates() {
    // Copy the contexts and clear pending updates
    // to prepare for new state settings
    const contexts = [];
    pendingUpdates.forEach(function (hook, contextAsKey) {
        // Important!!!
        // Use hook.context_ instead of contextAsKey
        // as it may be outdated due to the reconciliation process
        contexts.push(hook.context_);
    });
    pendingUpdates.clear();
    
    // Clear timeoutId to prepare for new state settings
    // happened in the renderTree (inside setLayoutEffect)
    timeoutId = null;
    
    // Re-render trees
    for (let i = 0; i < contexts.length; ++i) {
        renderTree(contexts[i]);
    }
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
