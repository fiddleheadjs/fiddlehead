import {isArray, isFunction, isNumber, isString} from './Util';
import {Fragment, NODE_FRAGMENT, NODE_TEXT, VirtualNode} from './VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}|null} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
export const createElement = (type, attributes, ...content) => {
    const {key, ref, ...props} = attributes || {};

    if (type === Fragment) {
        type = NODE_FRAGMENT;
    }

    const virtualNode = new VirtualNode(type, props, key, ref);

    if (isFunction(type)) {
        // JSX children
        if (content.length > 0) {
            virtualNode.props_.children = content.length > 1 ? content : content[0];
        }
    } else {
        // Append children directly
        _appendChildrenFromContent(virtualNode, content);
    }

    return virtualNode;
}

/**
 *
 * @param {*} content
 * @return {null|VirtualNode}
 */
 export const createVirtualNodeFromContent = (content) => {
    if (content instanceof VirtualNode) {
        return content;
    }
        
    if (isString(content) || isNumber(content)) {
        return new VirtualNode(NODE_TEXT, content);
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_FRAGMENT);
        _appendChildrenFromContent(node, content);
        return node;
    }

    return null;
}

/**
 * 
 * @param {VirtualNode} parentNode 
 * @param {Array} content
 */
const _appendChildrenFromContent = (parentNode, content) => {
    for (
        let childNode, prevChildNode = null, i = 0, len = content.length
        ; i < len
        ; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        
        if (childNode !== null) {
            childNode.parent_ = parentNode;
            childNode.slot_ = i;

            if (prevChildNode !== null) {
                prevChildNode.sibling_ = childNode;
            } else {
                parentNode.child_ = childNode;
            }

            prevChildNode = childNode;
        }
    }
}
