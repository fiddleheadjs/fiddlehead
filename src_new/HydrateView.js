import {linkNativeNode, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode, updateNativeTextNode, updateNativeElementAttributes} from './NativeDOM';
import {attachVirtualNode} from './Externals';
import {isFunction} from './Util';

// Important Note
// This module does not handle RootType

export const hydrateView = (virtualNode) => {
    virtualNode.ns_ = _determineNS(virtualNode);

    // Do nothing more with fragments
    if (_isDry(virtualNode.type_)) {
        return;
    }

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    if (__DEV__) {
        attachVirtualNode(nativeNode, virtualNode);
    }
}

export const rehydrateView = (newVirtualNode, oldVirtualNode) => {
    newVirtualNode.ns_ = _determineNS(newVirtualNode);

    // Do nothing more with fragments
    if (_isDry(newVirtualNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (__DEV__) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === NODE_TEXT) {
        if (newVirtualNode.props_ !== oldVirtualNode.props_) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_
            );
        }
    } else {
        updateNativeElementAttributes(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_,
            oldVirtualNode.props_
        );
    }
}

const _createNativeNode = (virtualNode) => {
    if (virtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(virtualNode.props_);
    }

    return createNativeElementWithNS(
        virtualNode.ns_,
        virtualNode.type_,
        virtualNode.props_
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

const _isDry = (type) => {
    return type === NODE_FRAGMENT || isFunction(type);
}
