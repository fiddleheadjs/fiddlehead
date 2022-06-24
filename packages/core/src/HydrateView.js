import {Fragment, TextNode, NAMESPACE_HTML, NAMESPACE_SVG} from './VNode';
import {createNativeElementWithNS, updateNativeElementAttributes, createNativeTextNode, updateNativeTextContent} from './NativeDOM';
import {linkNativeNodeWithVNode, attachVNodeToNativeNode} from './Externals';
import {isFunction} from './Util';

// Important!!!
// This module does not handle Portal nodes

export function hydrateView(vnode) {
    vnode.namespace_ = _determineNS(vnode);

    // Do nothing more with fragments
    if (_isDry(vnode.type_)) {
        return;
    }

    let nativeNode;
    if (vnode.type_ === TextNode) {
        nativeNode = createNativeTextNode(vnode.props_);
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!__DEV__) {
            vnode.props_ = null;
        }
    } else {
        nativeNode = createNativeElementWithNS(
            vnode.namespace_,
            vnode.type_,
            vnode.props_
        );
    }

    linkNativeNodeWithVNode(vnode, nativeNode);
    if (__DEV__) {
        attachVNodeToNativeNode(nativeNode, vnode);
    }
}

export function rehydrateView(newVNode, oldVNode) {
    newVNode.namespace_ = _determineNS(newVNode);

    // Do nothing more with fragments
    if (_isDry(newVNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNodeWithVNode(newVNode, oldVNode.nativeNode_);
    if (__DEV__) {
        attachVNodeToNativeNode(oldVNode.nativeNode_, newVNode);
    }

    if (newVNode.type_ === TextNode) {
        updateNativeTextContent(
            newVNode.nativeNode_,
            newVNode.props_
        );
        
        // In the production mode, remove text content from the virtual text node
        // to save memory. Later, we will compare the new text with the text content
        // of the native node, though it is not a perfect way to compare.
        if (!__DEV__) {
            newVNode.props_ = null;
        }
    } else {
        updateNativeElementAttributes(
            newVNode.nativeNode_,
            newVNode.props_,
            oldVNode.props_
        );
    }
}

// We only support HTML and SVG namespaces
// as the most of browsers support
function _determineNS(vnode) {
    // Intrinsic namespace
    if (vnode.type_ === 'svg') {
        return NAMESPACE_SVG;
    }

    // As we never hydrate the container node,
    // the parent_ never empty here
    if (vnode.parent_.namespace_ === NAMESPACE_SVG &&
        vnode.parent_.type_ === 'foreignObject'
    ) {
        return NAMESPACE_HTML;
    }

    // By default, pass namespace below.
    return vnode.parent_.namespace_;
}

// Check if a node type cannot be hydrated
function _isDry(type) {
    return type === Fragment || isFunction(type);
}
