import {RefHook} from './RefHook';
import {isArray, isFunction, isNumber, isString} from './Util';

/**
 *
 * @param {string|function} type
 * @constructor
 */
export function VirtualNode(type) {
    this.type_ = type;
    this.props_ = {};
    this.key_ = null;
    this.ref_ = null;

    this.hooks_ = [];

    /**
     * @type {VirtualNode|null}
     */
    this.parent_ = null;

    /**
     * @type {VirtualNode[]}
     */
    this.children_ = [];

    this.path_ = '';
    this.posInRow_ = null;

    this.nativeNode_ = null;
    this.ns_ = null;

    this.class_ = (type === NODE_FRAGMENT || type === NODE_ARRAY
        ? CLASS_COLLECTIVE
        : (isFunction(type)
            ? CLASS_FUNCTIONAL
            : CLASS_VIEWABLE));
}

// Do not support namespace MathML as almost browsers do not support as well
export const NS_HTML = 0;
export const NS_SVG = 1;

// Note:
// Use special URI characters

export const NODE_TEXT = '#';
export const NODE_ARRAY = '[';
export const NODE_FRAGMENT = '=';

export const CLASS_VIEWABLE = 0;
export const CLASS_FUNCTIONAL = 1;
export const CLASS_COLLECTIVE = 2;

export const PATH_SEP = '/';

/**
 * 
 * @param {*} key 
 * @returns {string}
 */
export function escapeVirtualNodeKey(key) {
    return '@' + encodeURIComponent(key);
}

let functionalTypeInc = 0;

/**
 * 
 * @param {Function} type 
 * @returns {string}
 */
export function createFunctionalTypeAlias(type) {
    return type.name + '{' + (++functionalTypeInc).toString(36);
}

let containerIdInc = 0;

/**
 * 
 * @returns {string}
 */
export function createContainerId() {
    return '~' + (++containerIdInc).toString(36);
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode 
 */
export function linkNativeNode(virtualNode, nativeNode) {
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
export function createVirtualNodeFromContent(content) {
    if (content instanceof VirtualNode) {
        return content;
    }

    if (isString(content) || isNumber(content)) {
        const node = new VirtualNode(NODE_TEXT);

        node.props_.children = content;

        return node;
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_ARRAY);

        let posInRow = -1;
        for (let i = 0; i < content.length; i++) {
            const child = createVirtualNodeFromContent(content[i]);
            if (child !== null) {
                appendChildVirtualNode(node, child, ++posInRow);
            }
        }

        return node;
    }

    return null;
}

/**
 * 
 * @param {VirtualNode} parent 
 * @param {VirtualNode} child
 * @param {number} posInRow
 */
export function appendChildVirtualNode(parent, child, posInRow) {
    child.parent_ = parent;
    child.posInRow_ = posInRow;
    parent.children_[posInRow] = child;
}
