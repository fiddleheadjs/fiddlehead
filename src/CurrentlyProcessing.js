let currentlyRenderingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

export function prepareCurrentlyRendering(functionalVirtualNode) {
    currentlyRenderingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
}

export function flushCurrentlyRendering() {
    currentlyRenderingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
}

export function resolveCurrentlyProcessing() {
    if (currentlyRenderingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return [currentlyRenderingFunctionalVirtualNode, ++currentlyProcessingHookIndex];
}
