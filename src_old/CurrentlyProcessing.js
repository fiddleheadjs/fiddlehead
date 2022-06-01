let currentlyProcessingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

export const prepareCurrentlyProcessing = (functionalVirtualNode) => {
    currentlyProcessingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
}

export const flushCurrentlyProcessing = () => {
    currentlyProcessingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
}

export const resolveCurrentlyProcessing = () => {
    if (currentlyProcessingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return [currentlyProcessingFunctionalVirtualNode, ++currentlyProcessingHookIndex];
}
