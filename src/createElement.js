import {isFunction} from './Util';
import {createVirtualNodeFromContent, NODE_FRAGMENT, VirtualNode} from './VirtualNode';

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

    props.children = content;
    
    return new VirtualNode(type, props, key, ref);
}

function _createStaticVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const newNode = new VirtualNode(type, props, key, ref);

    for (let i = 0; i < content.length; i++) {
        const childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            childNode.parent = newNode;
            childNode.posInRow = i;
            newNode.children.push(childNode);
        }
    }

    return newNode;
}
