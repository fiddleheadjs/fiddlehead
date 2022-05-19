import {VirtualNode, linkNativeNode, NS_HTML, NS_SVG, RootType} from './VirtualNode';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getAttachedVirtualNode, getRootId} from './Externals';

/**
 * 
 * @param {*} children 
 * @param {Element} rootNativeNode
 */
 export function mount(children, rootNativeNode) {
    const rootVirtualNode = createPortal(children, rootNativeNode);

    // Set an unique path to split tree states between roots
    rootVirtualNode.path_ = getRootId(rootNativeNode);
    
    resolveVirtualTree(rootVirtualNode);

    updateVirtualTree(rootVirtualNode);
}

/**
 * 
 * @param {*} children 
 * @param {Element} rootNativeNode
 * @returns {VirtualNode}
 */
export function createPortal(children, rootNativeNode) {
    /**
     * @type {VirtualNode}
     */
    let rootVirtualNode;

    if (!(rootVirtualNode = getAttachedVirtualNode(rootNativeNode))) {
        while (rootNativeNode.firstChild) {
            rootNativeNode.removeChild(rootNativeNode.firstChild);
        }
        
        rootVirtualNode = new VirtualNode(RootType);

        // Determine the namespace (we only support SVG and HTML namespaces)
        rootVirtualNode.ns_ = ('ownerSVGElement' in rootNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, rootNativeNode);
        attachVirtualNode(rootNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
}
