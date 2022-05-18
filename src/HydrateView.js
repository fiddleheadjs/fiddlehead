import {linkNativeNode, NODE_TEXT, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {attachVirtualNode} from './Externals';

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

export function hydrateViewableVirtualNode(viewableVirtualNode) {
    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (nativeNode !== null) {
        attachVirtualNode(nativeNode, viewableVirtualNode);
    }
}

function _createNativeNode(viewableVirtualNode) {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    return createNativeElementWithNS(
        _toNativeNS(viewableVirtualNode.ns_),
        viewableVirtualNode.type_,
        viewableVirtualNode.props_
    );
}

function _toNativeNS(ns) {
    if (ns === NS_SVG) {
        return 'http://www.w3.org/2000/svg';
    }

    return null;
}
