import {resolveCurrentlyProcessing} from './CurrentlyProcessing';
import {isFunction} from './Util';
import {updateVirtualTree} from './UpdateVirtualTree';

/**
 *
 * @param {*} initialValue
 * @param {function} setValue
 * @param {VirtualNode} context
 * @constructor
 */
export function StateHook(initialValue, setValue, context) {
    this.value_ = initialValue;
    this.setValue_ = setValue;
    this.context_ = context;
}

export function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        const hook = functionalVirtualNode.hooks_[hookIndex];
        return [hook.value_, hook.setValue_];
    }

    const setValue = (value) => {
        let newValue;
        
        if (isFunction(value)) {
            newValue = value(hook.value_);
        } else {
            newValue = value;
        }
        
        if (newValue !== hook.value_) {
            hook.value_ = newValue;
            updateVirtualTree(hook.context_, false);
        }
    };

    const hook = new StateHook(
        initialValue,
        setValue,
        functionalVirtualNode,
    );

    functionalVirtualNode.hooks_.push(hook);

    return [hook.value_, hook.setValue_];
}
