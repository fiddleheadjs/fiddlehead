import {Fragment, TextNode, NAMESPACE_HTML, NAMESPACE_SVG} from './VNode';
import {linkNativeNodeWithVNode, attachVNodeToNativeNode} from './NodeToNode';
import {isFunction} from './Util';
import {
    createNativeElement, updateNativeElementAttributes,
    createNativeTextNode, updateNativeTextContent
} from './NativeDOM';

// Important!!!
// This module does not handle Portal nodes

export let hydrateView = (vnode) => {
    vnode.namespace_ = _determineNS(vnode);

    // Do nothing more with fragments
    if (_isDry(vnode.type_)) {
        return;
    }

    let nativeNode;
    if (vnode.type_ === TextNode) {
        nativeNode = createNativeTextNode(vnode.props_);
    } else {
        nativeNode = createNativeElement(
            vnode.namespace_,
            vnode.type_,
            vnode.props_
        );
    }

    linkNativeNodeWithVNode(vnode, nativeNode);
    if (__DEV__) {
        attachVNodeToNativeNode(nativeNode, vnode);
    }
};

export let rehydrateView = (newVNode, oldVNode) => {
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
            newVNode.props_,
            oldVNode.props_
        );
    } else {
        updateNativeElementAttributes(
            newVNode.namespace_,
            newVNode.nativeNode_,
            newVNode.props_,
            oldVNode.props_
        );
    }
};

// We only support HTML and SVG namespaces
// as the most of browsers support
let _determineNS = (vnode) => {
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
};

// Check if a node type cannot be hydrated
let _isDry = (type) => {
    return type === Fragment || isFunction(type);
};
