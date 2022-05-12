import {linkNativeNode, NODE_ARRAY, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {isString} from './Util';
import {attachVirtualNode} from './Externals';

export function hydrateVirtualTree(virtualNode) {
    // Determine the namespace
    if (virtualNode.type_ === 'svg') {
        virtualNode.ns_ = NS_SVG;
    } else {
        if (virtualNode.parent_ !== null) {
            virtualNode.ns_ = virtualNode.parent_.ns_;
        } else {
            virtualNode.ns_ = NS_HTML;
        }
    }

    // Create the native node
    let nativeNode = null;

    if (virtualNode.type_ === NODE_TEXT) {
        nativeNode = createNativeTextNode(virtualNode.data_);
    } else if (virtualNode.type_ === NODE_FRAGMENT || virtualNode.type_ === NODE_ARRAY) {
        // Do nothing here
        // But be careful, removing it changes the condition
    } else if (isString(virtualNode.type_)) {
        let nativeNS = null;
        if (virtualNode.ns_ === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        nativeNode = createNativeElementWithNS(nativeNS, virtualNode.type_, virtualNode.props_);

        // For debug
        attachVirtualNode(nativeNode, virtualNode);
    }

    linkNativeNode(virtualNode, nativeNode);

    // Continue with the children
    for (let i = 0; i < virtualNode.children_.length; i++) {
        hydrateVirtualTree(virtualNode.children_[i]);
    }
}
