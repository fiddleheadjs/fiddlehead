import {resolveCurrentlyProcessing} from "./currentlyProcessing";
import {isFunction} from "./utils";
import {updateVirtualTree} from "./VirtualTreeUpdating";

/**
 *
 * @param {*} value
 * @param {function} setValue
 * @return {StateHook}
 * @constructor
 */
export function StateHook(value, setValue) {
    this.value = value;
    this.setValue = setValue;
}

export function useState(initialValue) {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks.length > hookIndex) {
        const hook = functionalVirtualNode.hooks[hookIndex];
        return [hook.value, hook.setValue];
    }

    const hook = new StateHook(
        initialValue,
        (value) => {
            let newValue;

            if (isFunction(value)) {
                newValue = value(hook.value);
            } else {
                newValue = value;
            }

            if (newValue !== hook.value) {
                hook.value = newValue;
                updateVirtualTree(functionalVirtualNode);
            }
        }
    );

    functionalVirtualNode.hooks.push(hook);

    return [hook.value, hook.setValue];
}
