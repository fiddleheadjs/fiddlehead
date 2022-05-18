import {VirtualNode, linkNativeNode, NS_HTML, NS_SVG, createRootId, RootType} from './VirtualNode';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getAttachedVirtualNode} from './Externals';

/**
 * 
 * @param {*} children 
 * @param {Element} rootNativeNode
 */
 export function mount(children, rootNativeNode) {
    const rootVirtualNode = createPortal(children, rootNativeNode);

    rootVirtualNode.path_ = createRootId();
    
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
        rootVirtualNode.ns_ = ('ownerSVGElement' in rootNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, rootNativeNode);
        attachVirtualNode(rootNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
}
