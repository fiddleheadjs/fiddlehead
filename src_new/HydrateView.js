import {linkNativeNode, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeFragment, createNativeTextNode} from './NativeDOM';
import {attachVirtualNode} from './Externals';
import {NODE_FRAGMENT, RootType} from './VirtualNode';
import {isFunction} from './Util';

export const hydrateVirtualNode = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        // Root nodes always have apredefined native nodes and namespaces
        return;
    }

    virtualNode.ns_ = _determineNS(virtualNode);

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    
    if (__DEV__) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, virtualNode);
        }
    }
}

const _createNativeNode = (node) => {
    if (node.type_ === NODE_TEXT) {
        return createNativeTextNode(node.props_.children);
    }

    if (node.type_ === NODE_FRAGMENT || isFunction(node.type_)) {
        return createNativeFragment();
    }

    return createNativeElementWithNS(
        node.ns_,
        node.type_,
        node.props_
    );
}

const _determineNS = (virtualNode) => {
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
