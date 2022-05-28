import {NS_SVG} from './VirtualNode';
import {updateNativeElementAttributes} from './NativeAttributes';

export const createNativeTextNode = (text) => {
    return document.createTextNode(text);
}

export const updateNativeTextNode = (node, text) => {
    node.textContent = text;
}

export const createNativeElementWithNS = (ns, type, attributes) => {
    const element = (ns === NS_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes, {});
    
    return element;
}

export const createNativeFragment = () => {
    const el = document.createElement('div');
    el.style.display = 'contents';
    return el;
}

export {
    updateNativeElementAttributes
}
