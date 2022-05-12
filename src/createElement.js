import {isFunction} from './Util';
import {appendChildVirtualNode, createVirtualNodeFromContent, NODE_FRAGMENT, VirtualNode} from './VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
export function createElement(type, attributes, ...content) {
    attributes = attributes || {};

    if (type === null) {
        return _createStaticVirtualNode(NODE_FRAGMENT, attributes, ...content);
    }

    if (isFunction(type)) {
        return _createFunctionalVirtualNode(type, attributes, ...content);
    }

    return _createStaticVirtualNode(type, attributes, ...content);
}

function _createFunctionalVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    // JSX children
    props.children = content;
    
    return new VirtualNode(type, props, key, ref);
}

function _createStaticVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const newNode = new VirtualNode(type, props, key, ref);

    let posInRow = -1;
    for (let i = 0; i < content.length; i++) {
        const childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            appendChildVirtualNode(newNode, childNode, ++posInRow);
        }
    }

    return newNode;
}
