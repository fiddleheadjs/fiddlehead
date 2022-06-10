import {NAMESPACE_SVG} from './VirtualNode';
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

export {
    updateNativeElementAttributes,
    updateNativeTextContent,
}
