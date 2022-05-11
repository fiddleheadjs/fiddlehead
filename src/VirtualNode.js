import {RefHook} from './RefHook';

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

    this.viewNode = null;
    this.ns = null;
}

export const NODE_TEXT = '#txt';
export const NODE_FRAGMENT = '#frg';

export const NS_HTML = 'html';
export const NS_SVG = 'svg';

export function linkViewNode(virtualNode, viewNode) {
    virtualNode.viewNode = viewNode;

    if (virtualNode.ref instanceof RefHook) {
        virtualNode.ref.current = viewNode;
    }
}
