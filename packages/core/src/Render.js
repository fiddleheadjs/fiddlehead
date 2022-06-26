import {createPortal, createVNodeFromPortalElement} from './PortalElement';
import {attachVNodeToNativeNode, extractVNodeFromNativeNode} from './Externals';
import {renderTree} from './RenderTree';

/**
 * 
 * @param {any} children 
 * @param {Element} targetNativeNode
 */
 export function render(children, targetNativeNode) {
    let root = extractVNodeFromNativeNode(targetNativeNode);

    if (root) {
        // Update children
        root.props_.children = children;
    } else {
        // Create a new root
        if (__DEV__) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        const portalElement = createPortal(children, targetNativeNode);
        root = createVNodeFromPortalElement(portalElement);
        attachVNodeToNativeNode(targetNativeNode, root);
    }

    renderTree(root);
}
