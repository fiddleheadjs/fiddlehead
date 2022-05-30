import {processCurrentHook} from './CurrentlyProcessing';
import {isFunction} from './Util';
import {resolveTree} from './ResolveTree';

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
            resolveTree(this.context_);
        }
    };

    this.next_ = null;
}

export const useState = (initialValue) => {
    return processCurrentHook(
        (currentNode) => new StateHook(currentNode, initialValue),
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
}
