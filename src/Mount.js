import {VirtualNode, linkNativeNode, NAMESPACE_HTML, NAMESPACE_SVG, Portal} from './VirtualNode';
import {attachVirtualNode, extractVirtualNode} from './Externals';
import {resolveTree} from './ResolveTree';

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 export function mount(children, targetNativeNode) {
    const portal = createPortal(children, targetNativeNode);

    // Render view
    resolveTree(portal);
}

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 * @returns {VirtualNode}
 */
export function createPortal(children, targetNativeNode) {
    /**
     * @type {VirtualNode}
     */
    let portal;

    if (!(portal = extractVirtualNode(targetNativeNode))) {
        if (__DEV__) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        portal = new VirtualNode(Portal, {}, null);

        // Determine the namespace (we only support SVG and HTML namespaces)
        portal.namespace_ = ('ownerSVGElement' in targetNativeNode) ? NAMESPACE_SVG : NAMESPACE_HTML;
        
        linkNativeNode(portal, targetNativeNode);
        attachVirtualNode(targetNativeNode, portal);
    }

    portal.props_.children = children;

    return portal;
}
