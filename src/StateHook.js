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
    this.value = initialValue;
    this.setValue = setValue;
    this.context = context;
}

export function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks.length > hookIndex) {
        const hook = functionalVirtualNode.hooks[hookIndex];
        return [hook.value, hook.setValue];
    }

    const setValue = (value) => {
        let newValue;
        
        if (isFunction(value)) {
            newValue = value(hook.value);
        } else {
            newValue = value;
        }
        
        if (newValue !== hook.value) {
            hook.value = newValue;
            updateVirtualTree(hook.context, false);
        }
    };

    const hook = new StateHook(
        initialValue,
        setValue,
        functionalVirtualNode,
    );

    functionalVirtualNode.hooks.push(hook);

    return [hook.value, hook.setValue];
}
