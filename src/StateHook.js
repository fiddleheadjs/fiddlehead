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

export function useError() {
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
            return new StateHook(STATE_ERROR, null, currentNode);
        },
        function (currentHook) {
            return [currentHook.value_, function () {
                currentHook.setValue_(null);
            }];
        }
    );
}

const pendingUpdates = new Map();
let currentTimeoutId = null;

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

    if (this.value_ !== newValue) {
        // Set value synchronously
        this.value_ = newValue;

        // Enqueue update
        // We store the hook itself with the purpose of referring to
        // the up-to-date context when flushing updates.
        // So, we don't need to store all pending hooks inside a context.
        pendingUpdates.set(this.context_, this);

        // Reset timer
        if (currentTimeoutId !== null) {
            clearTimeout(currentTimeoutId);
        }
        currentTimeoutId = setTimeout(_flushUpdates);
    }
}

function _flushUpdates() {
    // Clear timeout ID to prepare for new state settings
    // happened in the renderTree (inside setLayoutEffect)
    currentTimeoutId = null;

    // Copy the hooks and clear pending updates
    // to prepare for new state settings
    const hooksAsRefs = [];

    // Important!!!
    // Do NOT copy hook.context_ here as they
    // can be outdated during the reconciliation process
    pendingUpdates.forEach(function (hook, outdatedContext) {
        hooksAsRefs.push(hook);
    });
    pendingUpdates.clear();
    
    // Re-render trees
    for (let i = 0; i < hooksAsRefs.length; ++i) {
        renderTree(hooksAsRefs[i].context_);
    }
}
