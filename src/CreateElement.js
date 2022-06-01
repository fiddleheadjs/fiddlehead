import {isArray, isFunction, isNumber, isString} from './Util';
import {Fragment, TextNode, VirtualNode} from './VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}|null} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
export const createElement = (type, attributes, ...content) => {
    const {key, ...props} = attributes || {};

    const virtualNode = new VirtualNode(type, props, key);

    if (isFunction(type)) {
        // JSX children
        if (content.length > 0) {
            virtualNode.props_.children = content.length > 1 ? content : content[0];
        }
    } else if (type === TextNode) {
        // Place TextNode after Function
        // because this type will be rarely used
        virtualNode.props_.children = content.map(t => '' + t).join('');
    } else {
        // Append children directly with static nodes
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
        
    if (isString(content)) {
        return new VirtualNode(TextNode, {children: content});
    }

    if (isNumber(content)) {
        return new VirtualNode(TextNode, {children: '' + content});
    }

    if (isArray(content)) {
        const fragment = new VirtualNode(Fragment);
        _appendChildrenFromContent(fragment, content);
        return fragment;
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
        let childNode, prevChildNode = null, i = 0;
        i < content.length; ++i
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
