import {linkNativeNode, RootType, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode, updateNativeTextNode, updateNativeElementAttributes} from './NativeDOM';
import {attachVirtualNode} from './Externals';
import {isFunction} from './Util';

export const hydrateView = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        // Root nodes always have apredefined native nodes and namespaces
        return;
    }

    virtualNode.ns_ = _determineNS(virtualNode);

    if (virtualNode.type_ === NODE_FRAGMENT || isFunction(virtualNode.type_)) {
        // Do nothing with fragments
        return;
    }

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    if (__DEV__) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, virtualNode);
        }
    }
}

export const rehydrateView = (newVirtualNode, oldVirtualNode) => {
    if (newVirtualNode.type_ === RootType) {
        // Root nodes always have apredefined native nodes and namespaces
        return;
    }

    newVirtualNode.ns_ = _determineNS(newVirtualNode);

    if (newVirtualNode.type_ === NODE_FRAGMENT || isFunction(newVirtualNode.type_)) {
        // Do nothing with fragments
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (__DEV__) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === NODE_TEXT) {
        if (newVirtualNode.props_.children !== oldVirtualNode.props_.children) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_.children
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

const _createNativeNode = (node) => {
    if (node.type_ === NODE_TEXT) {
        return createNativeTextNode(node.props_.children);
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
