import {isArray, isFunction, isNumber, isString, slice} from './Util';
import {Fragment, TextNode, VirtualNode} from './VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {*} content
 * @return {VirtualNode}
 */
export function createElement(type, props, content) {
    if (props === null) {
        props = {};
    }
    
    const key = props.key;
    delete props.key;
    
    const virtualNode = new VirtualNode(type, props, key);

    if (arguments.length > 2) {
        const multiple = arguments.length > 3;

        if (multiple) {
            content = slice.call(arguments, 2);
        }
    
        if (isFunction(type)) {
            // JSX children
            virtualNode.props_.children = content;
        } else if (type === TextNode) {
            // Place TextNode after Function
            // because this way is much less frequently used
            if (multiple) {
                virtualNode.props_.children = content.map(text => _normalizeText(text)).join('');
            } else {
                virtualNode.props_.children = _normalizeText(content);
            }
        } else {
            // Append children directly with static nodes
            _appendChildrenFromContent(virtualNode, multiple ? content : [content]);
        }
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
        const fragment = new VirtualNode(Fragment, {});
        _appendChildrenFromContent(fragment, content);
        return fragment;
    }

    return null;
}

const _normalizeText = (text) => {
    if (isString(text)) {
        return text;
    }

    if (isNumber(text)) {
        return '' + text;
    }
    
    return '';
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
