import {linkNativeNode, NODE_TEXT} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {attachVirtualNode} from './Externals';

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

export const hydrateViewableVirtualNode = (viewableVirtualNode) => {
    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (__DEV__) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, viewableVirtualNode);
        }
    }
}

const _createNativeNode = (viewableVirtualNode) => {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    return createNativeElementWithNS(
        viewableVirtualNode.ns_,
        viewableVirtualNode.type_,
        viewableVirtualNode.props_
    );
}
