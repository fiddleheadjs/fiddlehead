import {VNode, NAMESPACE_HTML, NAMESPACE_SVG, Portal} from './VNode';
import {linkNativeNodeWithVNode} from './NodeToNode';

/**
 * 
 * @param {any} content 
 * @param {Element} nativeNode
 * @constructor
 */
export function PortalElement(content, nativeNode) {
    this.content_ = content;
    this.nativeNode_ = nativeNode;
}

/**
 * 
 * @param {any} content 
 * @param {Element} nativeNode 
 * @returns {PortalElement}
 */
export let createPortal = (content, nativeNode) => {
    return new PortalElement(content, nativeNode);
};

/**
 * 
 * @param {PortalElement} element
 * @returns {VNode}
 */
export let createVNodeFromPortalElement = (element) => {
    let vnode = new VNode(Portal, {children: element.content_});

    // Determine the namespace (we only support SVG and HTML namespaces)
    vnode.namespace_ = ('ownerSVGElement' in element.nativeNode_) ? NAMESPACE_SVG : NAMESPACE_HTML;
    
    linkNativeNodeWithVNode(vnode, element.nativeNode_);
    
    // Do not attach the vnode to the native node,
    // Because many portals can share the same native node.

    return vnode;
};
