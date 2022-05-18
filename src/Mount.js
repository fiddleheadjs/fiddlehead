import {VirtualNode, linkNativeNode, NS_HTML, NS_SVG, createContainerId} from './VirtualNode';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getAttachedVirtualNode} from './Externals';

/**
 *
 * @param {*} root
 * @param {Element} container
 */
export function mount(root, container) {
    /**
     * @type {VirtualNode}
     */
    let containerVirtualNode;

    if (!(containerVirtualNode = getAttachedVirtualNode(container))) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        containerVirtualNode = new VirtualNode(props => props.children);
        containerVirtualNode.path_ = createContainerId();
        containerVirtualNode.ns_ = ('ownerSVGElement' in container) ? NS_SVG : NS_HTML;
        linkNativeNode(containerVirtualNode, container);
        attachVirtualNode(container, containerVirtualNode);
    }
    
    containerVirtualNode.props_.children = root;
    updateVirtualTree(containerVirtualNode);
}
