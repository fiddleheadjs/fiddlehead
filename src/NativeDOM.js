import {NAMESPACE_SVG} from './VirtualNode';
import {updateNativeElementAttributes} from './NativeAttributes';
import {EMPTY_OBJECT} from './Constants';

export function createNativeTextNode(text) {
    return document.createTextNode(text);
}

export function updateNativeTextNode(node, text) {
    node.textContent = text;
}

export function createNativeElementWithNS(ns, type, attributes) {
    const element = (ns === NAMESPACE_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes, EMPTY_OBJECT);
    
    return element;
}

export {
    updateNativeElementAttributes
}
