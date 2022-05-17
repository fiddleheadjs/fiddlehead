import {linkNativeNode, NODE_ARRAY, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {isFunction} from './Util';
import {attachVirtualNode} from './Externals';

export function hydrateVirtualNode(virtualNode) {
    // Determine the namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    // Create the native node
    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    
    if (nativeNode !== null) {
        attachVirtualNode(nativeNode, virtualNode);
    }
}

function _determineNS(virtualNode) {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NS_SVG;
    }
 
    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.ns_ === NS_SVG && virtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }
    
    // By default, pass namespace below.
    return virtualNode.parent_.ns_;
}

function _createNativeNode(virtualNode) {
    if (isFunction(virtualNode.type_)) {
        return null;
    }
    
    if (virtualNode.type_ === NODE_FRAGMENT || virtualNode.type_ === NODE_ARRAY) {
        // Do nothing here
        // But be careful, removing it changes the condition
        return null;
    }

    if (virtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(virtualNode.data_);
    }

    {
        let nativeNS = null;
        if (virtualNode.ns_ === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        return createNativeElementWithNS(nativeNS, virtualNode.type_, virtualNode.props_);
    }
}
