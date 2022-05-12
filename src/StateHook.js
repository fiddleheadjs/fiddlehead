import {resolveCurrentlyProcessing} from './CurrentlyProcessing';
import {isFunction} from './Util';
import {updateVirtualTree} from './UpdateVirtualTree';

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @constructor
 */
export function StateHook(context, initialValue) {
    this.context_ = context;
    
    this.value_ = initialValue;

    this.setValue_ = (value) => {
        let newValue;
        
        if (isFunction(value)) {
            newValue = value(this.value_);
        } else {
            newValue = value;
        }
        
        if (newValue !== this.value_) {
            this.value_ = newValue;
            updateVirtualTree(this.context_, false);
        }
    };
}

export function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        const hook = functionalVirtualNode.hooks_[hookIndex];
        return [hook.value_, hook.setValue_];
    }

    const hook = new StateHook(
        functionalVirtualNode,
        initialValue,
    );

    functionalVirtualNode.hooks_.push(hook);

    return [hook.value_, hook.setValue_];
}
