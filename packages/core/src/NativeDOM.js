import {NAMESPACE_SVG} from './VNode';
import {updateNativeElementAttributes, updateNativeTextContent} from './NativeAttributes';

export function createNativeTextNode(text) {
    return document.createTextNode(text);
}

export function createNativeElementWithNS(ns, type, attributes) {
    const element = (ns === NAMESPACE_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes);
    
    return element;
}

export function removeNativeNode(nativeNode) {
    if (nativeNode.parentNode !== null) {
        nativeNode.parentNode.removeChild(nativeNode);
    }
}

export function insertNativeNodeAfter(parent, newChild, childBefore) {
    parent.insertBefore(newChild, (
        childBefore !== null ? childBefore.nextSibling : parent.firstChild
    ));
}

export {
    updateNativeElementAttributes,
    updateNativeTextContent,
}
