let currentlyProcessingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

export function prepareCurrentlyProcessing(functionalVirtualNode) {
    currentlyProcessingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
}

export function flushCurrentlyProcessing() {
    currentlyProcessingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
}

export function resolveCurrentlyProcessing() {
    if (currentlyProcessingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return [currentlyProcessingFunctionalVirtualNode, ++currentlyProcessingHookIndex];
}
