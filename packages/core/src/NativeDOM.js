import {NAMESPACE_SVG} from './VNode';
import {updateNativeElementAttributes, updateNativeTextContent} from './NativeAttributes';

export let createNativeTextNode = (text) => {
    return document.createTextNode(text);
};

export let createNativeElement = (namespace, type, attributes) => {
    let element = (namespace === NAMESPACE_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(namespace, element, attributes);
    
    return element;
};

export let removeNativeNode = (nativeNode) => {
    if (nativeNode.parentNode !== null) {
        nativeNode.parentNode.removeChild(nativeNode);
    }
};

export let insertNativeNodeAfter = (parent, newChild, childBefore) => {
    parent.insertBefore(newChild, (
        childBefore !== null ? childBefore.nextSibling : parent.firstChild
    ));
};

export {
    updateNativeElementAttributes,
    updateNativeTextContent,
};
