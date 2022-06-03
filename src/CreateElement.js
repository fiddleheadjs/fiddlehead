import {Ref} from './RefHook';
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
    
    // Normalize key
    let key = null;
    if (!(props.key === undefined || props.key === null)) {
        key = '' + key;
    }
    delete props.key;

    // Normalize ref
    if (!(props.ref === undefined || props.ref instanceof Ref)) {
        if (__DEV__) {
            console.error('The ref value must be created by the useRef hook');
        }
        delete props.ref;
    }
    
    // Create the node
    const virtualNode = new VirtualNode(type, props, key);

    // Append children
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
                let text = '', i = 0;
                for (; i < content.length; ++i) {
                    text += _normalizeText(content[i]);
                }
                virtualNode.props_.children = text;
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
 export function createVirtualNodeFromContent(content) {
    if (content instanceof VirtualNode) {
        return content;
    }
        
    if (isString(content)) {
        return new VirtualNode(TextNode, {children: content}, null);
    }

    if (isNumber(content)) {
        return new VirtualNode(TextNode, {children: '' + content}, null);
    }

    if (isArray(content)) {
        const fragment = new VirtualNode(Fragment, {}, null);
        _appendChildrenFromContent(fragment, content);
        return fragment;
    }

    return null;
}

/**
 * 
 * @param {*} text 
 * @returns {string}
 */
function _normalizeText(text) {
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
function _appendChildrenFromContent(parentNode, content) {
    let childNode, prevChildNode = null, i = 0;
    for (; i < content.length; ++i) {
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
