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
 * @param {VNode} context
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
        function (currentVNode) {
            return new StateHook(STATE_NORMAL, initialValue, currentVNode);
        },
        function (currentHook) {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

export function useError() {
    return resolveCurrentStateHook(
        function (currentVNode) {
            // Make sure we have only one error hook in a component
            if (__DEV__) {
                let hook = currentVNode.stateHook_;
                while (hook !== null) {
                    if (hook.tag_ === STATE_ERROR) {
                        console.error('A component accepts only one useError hook');
                    }
                    hook = hook.next_;
                }
            }
            return new StateHook(STATE_ERROR, null, currentVNode);
        },
        function (currentHook) {
            return [currentHook.value_, function () {
                currentHook.setValue_(null);
            }];
        }
    );
}

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

        // Schedule a work to update the UI
        if (this.context_.updateId_ === null) {
            this.context_.updateId_ = setTimeout(_flushUpdates, 0, this);
        }
    }
}

function _flushUpdates(hook) {
    // Find the highest node also has pending updates
    let highestContext;
    let current = hook.context_;
    do {
        if (current.updateId_ !== null) {
            highestContext = current;
        }
        current = current.parent_;
    } while (current !== null);

    // Re-render tree from the highest node
    renderTree(highestContext);
}
