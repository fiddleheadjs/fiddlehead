import {catchError} from './CatchError';
import {resolveCurrentStateHook} from './CurrentlyProcessing';
import {renderTree} from './RenderTree';
import {isFunction} from './Util';

export const STATE_NORMAL = 0;
export const STATE_ERROR = 1;

/**
 *
 * @param {number} tag
 * @param {VNode} context
 * @param {any} initialValue
 * @constructor
 */
export function StateHook(tag, context, initialValue) {
    this.tag_ = tag;
    this.context_ = context;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    if (tag === STATE_ERROR) {
        this.resetValue_ = () => _setState.call(this, initialValue);
    }
    this.next_ = null;
}

export let useState = (initialValue) => {
    return resolveCurrentStateHook(
        (currentVNode) => {
            return new StateHook(STATE_NORMAL, currentVNode, initialValue);
        },
        (currentHook) => {
            return [currentHook.value_, currentHook.setValue_];
        }
    );
};

export let useCatch = () => {
    return resolveCurrentStateHook(
        (currentVNode) => {
            // Make sure we have only one error hook in a component
            if (__DEV__) {
                let hook = currentVNode.stateHook_;
                while (hook !== null) {
                    if (hook.tag_ === STATE_ERROR) {
                        console.error('A component accepts only one useCatch hook');
                    }
                    hook = hook.next_;
                }
            }
            return new StateHook(STATE_ERROR, currentVNode, null);
        },
        (currentHook) => {
            return [currentHook.value_, currentHook.resetValue_];
        }
    );
};

let _setState = function (value) {
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
};

let _flushUpdates = (hook) => {
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
};
