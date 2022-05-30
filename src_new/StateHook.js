import {resolveCurrentHook} from './CurrentlyProcessing';
import {isFunction} from './Util';
import {resolveTree} from './ResolveTree';

let timeoutID = null;
const queueMap = new Map();

const _flushQueues = () => {
    queueMap.forEach((queue, context) => {
        let value, hook, hasChanges = false;
        
        while (queue.length > 0) {
            [value, hook] = queue.pop();

            let newValue;
            
            if (isFunction(value)) {
                newValue = value(hook.value_);
            } else {
                newValue = value;
            }
            
            if (newValue !== hook.value_) {
                hook.value_ = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resolveTree(context);
        }
    });

    queueMap.clear();
    timeoutID = null;
};

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
        let queue = queueMap.get(this.context_);
        if (queue === undefined) {
            queue = [[value, this]];
            queueMap.set(this.context_, queue);
        } else {
            queue.push([value, this]);
        }

        if (timeoutID !== null) {
            clearTimeout(timeoutID);
        }

        timeoutID = setTimeout(_flushQueues);
    };

    this.next_ = null;
}

export const useState = (initialValue) => {
    return resolveCurrentHook(
        (currentNode) => new StateHook(currentNode, initialValue),
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
}
