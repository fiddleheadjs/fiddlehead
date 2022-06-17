import {linkNativeNode, Fragment, TextNode, NAMESPACE_HTML, NAMESPACE_SVG} from './VirtualNode';
import {createNativeElementWithNS, updateNativeElementAttributes, createNativeTextNode, updateNativeTextContent} from './NativeDOM';
import {attachVirtualNode} from './Externals';
import {isFunction} from './Util';

// Important!!!
// This module does not handle Portal nodes

export function hydrateView(virtualNode) {
    virtualNode.namespace_ = _determineNS(virtualNode);

    // Do nothing more with fragments
    if (_isDry(virtualNode.type_)) {
        return;
    }

    let nativeNode;
    if (virtualNode.type_ === TextNode) {
        nativeNode = createNativeTextNode(virtualNode.props_);
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!__DEV__) {
            virtualNode.props_ = null;
        }
    } else {
        nativeNode = createNativeElementWithNS(
            virtualNode.namespace_,
            virtualNode.type_,
            virtualNode.props_
        );
    }

    linkNativeNode(virtualNode, nativeNode);
    if (__DEV__) {
        attachVirtualNode(nativeNode, virtualNode);
    }
}

export function rehydrateView(newVirtualNode, oldVirtualNode) {
    newVirtualNode.namespace_ = _determineNS(newVirtualNode);

    // Do nothing more with fragments
    if (_isDry(newVirtualNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (__DEV__) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === TextNode) {
        updateNativeTextContent(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_
        );
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!__DEV__) {
            newVirtualNode.props_ = null;
        }
    } else {
        updateNativeElementAttributes(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_,
            oldVirtualNode.props_
        );
    }
}

// We only support HTML and SVG namespaces
// as the most of browsers support
function _determineNS(virtualNode) {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NAMESPACE_SVG;
    }

    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.namespace_ === NAMESPACE_SVG &&
        virtualNode.parent_.type_ === 'foreignObject'
    ) {
        return NAMESPACE_HTML;
    }

    // By default, pass namespace below.
    return virtualNode.parent_.namespace_;
}

// Check if a node type cannot be hydrated
function _isDry(type) {
    return type === Fragment || isFunction(type);
}
