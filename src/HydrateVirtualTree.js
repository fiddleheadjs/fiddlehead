import {linkNativeNode, NODE_ARRAY, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createNativeElementWithNS, createNativeTextNode} from './NativeDOM';
import {isString} from './Util';
import {attachVirtualNode} from './Externals';

export function hydrateVirtualTree(virtualNode) {
    // Determine the namespace
    if (virtualNode.type === 'svg') {
        virtualNode.ns = NS_SVG;
    } else {
        if (virtualNode.parent !== null) {
            virtualNode.ns = virtualNode.parent.ns;
        } else {
            virtualNode.ns = NS_HTML;
        }
    }

    // Create the native node
    let nativeNode = null;

    if (virtualNode.type === NODE_TEXT) {
        nativeNode = createNativeTextNode(virtualNode.data);
    } else if (virtualNode.type === NODE_FRAGMENT || virtualNode.type === NODE_ARRAY) {
        // Do nothing here
        // But be careful, removing it changes the condition
    } else if (isString(virtualNode.type)) {
        let nativeNS = null;
        if (virtualNode.ns === NS_SVG) {
            nativeNS = 'http://www.w3.org/2000/svg';
        }
        nativeNode = createNativeElementWithNS(nativeNS, virtualNode.type, virtualNode.props);

        // For debug
        attachVirtualNode(nativeNode, virtualNode);
    }

    linkNativeNode(virtualNode, nativeNode);

    // Continue with the children
    for (let i = 0; i < virtualNode.children.length; i++) {
        hydrateVirtualTree(virtualNode.children[i]);
    }
}
