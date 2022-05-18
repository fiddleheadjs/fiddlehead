import {VirtualNode, linkNativeNode, NS_HTML, NS_SVG, createContainerId} from './VirtualNode';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getAttachedVirtualNode} from './Externals';

export function RootType({children}) {
    return children;
}

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

export function mount(children, rootNativeNode) {
    const rootVirtualNode = createPortal(children, rootNativeNode);
    rootVirtualNode.path_ = createContainerId();
    updateVirtualTree(rootVirtualNode);
}
