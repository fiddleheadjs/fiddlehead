import {RefHook} from './RefHook';
import {isArray, isFunction, isNumber, isString} from './Util';

/**
 * 
 * @param {function|string} type 
 * @param {{}?} props 
 * @param {string|number?} key 
 * @param {RefHook?} ref 
 */
export function VirtualNode(type, props = {}, key = null, ref = null) {
    this.type_ = type;

    this.key_ = key;

    this.parent_ = null;

    this.path_ = '';

    this.ns_ = null;
    
    if (type !== NODE_TEXT) {
        this.children_ = [];
    }
    
    if (type !== NODE_FRAGMENT) {
        this.props_ = props;

        this.ref_ = ref;
    
        this.nativeNode_ = null;

        if (isFunction(type)) {
            this.hooks_ = [];
        }
    }
}

// Do not support namespace MathML as almost browsers do not support as well
export const NS_HTML = 0;
export const NS_SVG = 1;

// Note:
// Use special URI characters

export const NODE_TEXT = '#';
export const NODE_FRAGMENT = '[';

export const PATH_SEP = '/';

export const RootType = (props) => {
    return props.children;
}

/**
 * 
 * @param {string|number} key 
 * @returns {string}
 */
export const escapeVirtualNodeKey = (key) => {
    return '@' + encodeURIComponent(key);
}

let functionalTypeInc = 0;
let rootIdInc = 0;

/**
 * 
 * @param {Function} type 
 * @returns {string}
 */
export const createFunctionalTypeAlias = (type) => {
    return (
        (__DEV__ ? type.name : '') +
        '{' + (++functionalTypeInc).toString(36)
    );
}

/**
 * 
 * @returns {string}
 */
export const createRootId = () => {
    return '~' + (++rootIdInc).toString(36);
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode 
 */
export const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ instanceof RefHook) {
        virtualNode.ref_.current = nativeNode;
    }
}

/**
 *
 * @param {*} content
 * @return {null|VirtualNode}
 */
export const createVirtualNodeFromContent = (content) => {
    let node = null;

    if (content instanceof VirtualNode) {
        node = content;
    }
    else if (isString(content) || isNumber(content)) {
        node = new VirtualNode(NODE_TEXT, {children: content});
    }
    else if (isArray(content)) {
        node = new VirtualNode(NODE_FRAGMENT);
        appendChildrenFromContent(node, content);
    }

    return node;
}

/**
 * 
 * @param {VirtualNode} parentNode 
 * @param {Array} content
 */
export const appendChildrenFromContent = (parentNode, content) => {
    for (
        let childNode, i = 0, len = content.length
        ; i < len
        ; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            parentNode.children_.push(childNode);
            childNode.parent_ = parentNode;
        }
    }
}
