import {linkNativeNode, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {attachVirtualNode} from './Externals';

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

export function hydrateViewableVirtualNode(viewableVirtualNode) {
    // Determine the namespace
    viewableVirtualNode.ns_ = _determineNS(viewableVirtualNode);

    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (nativeNode !== null) {
        attachVirtualNode(nativeNode, viewableVirtualNode);
    }
}

function _determineNS(viewableVirtualNode) {
    // Intrinsic namespace
    if (viewableVirtualNode.type_ === 'svg') {
        return NS_SVG;
    }
 
    // As we never hydrate the container node,
    // the parent_ never empty here
    if (viewableVirtualNode.parent_.ns_ === NS_SVG && viewableVirtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }
    
    // By default, pass namespace below.
    return viewableVirtualNode.parent_.ns_;
}

function _createNativeNode(viewableVirtualNode) {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    {
        let nativeNS = null;
        if (viewableVirtualNode.ns_ === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        return createNativeElementWithNS(nativeNS, viewableVirtualNode.type_, viewableVirtualNode.props_);
    }
}
