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
    this.type = type;
    this.props = props;
    this.key = key;
    this.ref = ref;

    this.hooks = [];

    this.parent = null;
    this.children = [];
    this.path = [];
    this.posInRow = -1;

    this.viewNode = null;
    this.ns = null;
}

export const NODE_TEXT = '#txt';
export const NODE_ARRAY = '#arr';
export const NODE_FRAGMENT = '#frg';

export const NS_HTML = 'html';
export const NS_SVG = 'svg';

export function linkViewNode(virtualNode, viewNode) {
    virtualNode.viewNode = viewNode;

    if (virtualNode.ref instanceof RefHook) {
        virtualNode.ref.current = viewNode;
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
        node.text = String(content);
        return node;
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_ARRAY, {}, null, null);
        for (let i = 0; i < content.length; i++) {
            const child = createVirtualNodeFromContent(content[i]);
            if (child !== null) {
                child.parent = node;
                child.posInRow = i;
                node.children.push(child);
            }
        }
        return node;
    }

    return null;
}
