import {VirtualNode, linkNativeNode, NS_HTML, NS_SVG, RootType} from './VirtualNode';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, extractVirtualNode, getRootId} from './Externals';

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 export function mount(children, targetNativeNode) {
    const rootVirtualNode = createPortal(children, targetNativeNode);

    // Set an unique path to split tree states between roots
    rootVirtualNode.path_ = getRootId(targetNativeNode);
    
    resolveVirtualTree(rootVirtualNode);

    updateVirtualTree(rootVirtualNode);
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
    let rootVirtualNode;

    if (!(rootVirtualNode = extractVirtualNode(targetNativeNode))) {
        if (__DEV__) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        rootVirtualNode = new VirtualNode(RootType);

        // Determine the namespace (we only support SVG and HTML namespaces)
        rootVirtualNode.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, targetNativeNode);
        attachVirtualNode(targetNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
}
