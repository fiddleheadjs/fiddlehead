import {VNode, NAMESPACE_HTML, NAMESPACE_SVG, Portal} from './VNode';
import {linkNativeNodeWithVNode, attachVNodeToNativeNode, extractVNodeFromNativeNode} from './Externals';
import {renderTree} from './RenderTree';

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 */
 export function render(children, targetNativeNode) {
    const portal = createPortal(children, targetNativeNode);

    renderTree(portal);
}

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 * @returns {VNode}
 */
export function createPortal(children, targetNativeNode) {
    /**
     * @type {VNode}
     */
    let portal;

    if (!(portal = extractVNodeFromNativeNode(targetNativeNode))) {
        if (__DEV__) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        portal = new VNode(Portal, {});

        // Determine the namespace (we only support SVG and HTML namespaces)
        portal.namespace_ = ('ownerSVGElement' in targetNativeNode) ? NAMESPACE_SVG : NAMESPACE_HTML;
        
        linkNativeNodeWithVNode(portal, targetNativeNode);
        attachVNodeToNativeNode(targetNativeNode, portal);
    }

    portal.props_.children = children;

    return portal;
}
