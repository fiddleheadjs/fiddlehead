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

export const useState = (initialValue) => {
    return resolveCurrentStateHook(
        (currentVNode) => {
            return new StateHook(STATE_NORMAL, initialValue, currentVNode);
        },
        (currentHook) => {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
}

export const useError = () => {
    return resolveCurrentStateHook(
        (currentVNode) => {
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
        (currentHook) => {
            return [currentHook.value_, () => {
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

const _flushUpdates = (hook) => {
    // Find the highest node also has pending updates
    let highestContext = null;
    let current = hook.context_;
    while (current !== null) {
        if (current.updateId_ !== null) {
            highestContext = current;
        }
        current = current.parent_;
    }

    // Re-render tree from the highest node
    if (highestContext !== null) {
        renderTree(highestContext);
    }
}
