import {RefHook} from './RefHook';
import {isArray, isNumber, isString} from './Util';

/**
 *
 * @param {string|function} type
 * @param {{}} props
 * @param {string|null} key
 * @param {RefHook|null} ref
 * @return {VirtualNode}
 * @constructor
 */
export function VirtualNode(type, props, key, ref) {
    this.type_ = type;
    this.props_ = props;
    this.key_ = key;
    this.ref_ = ref;

    this.hooks_ = [];

    this.parent_ = null;
    this.children_ = [];
    this.path_ = [];
    this.posInRow_ = null;

    this.data_ = null;
    this.nativeNode_ = null;
    this.ns_ = null;
}

export const NODE_TEXT = '#txt';
export const NODE_ARRAY = '#arr';
export const NODE_FRAGMENT = '#frg';

export const NS_HTML = 'html';
export const NS_SVG = 'svg';

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
        const node = new VirtualNode(NODE_TEXT, {}, null, null);
        node.data_ = content;
        return node;
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_ARRAY, {}, null, null);
        for (let i = 0; i < content.length; i++) {
            const child = createVirtualNodeFromContent(content[i]);
            if (child !== null) {
                child.parent_ = node;
                child.posInRow_ = i;
                node.children_.push(child);
            }
        }
        return node;
    }

    return null;
}
