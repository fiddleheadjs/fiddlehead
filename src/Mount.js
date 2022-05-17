import {resolveVirtualTree} from './ResolveVirtualTree';
import {VirtualNode, appendChildVirtualNode, linkNativeNode, NS_HTML, NS_SVG} from './VirtualNode';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getAttachedVirtualNode, getContainerId} from './Externals';

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

    /**
     * @type {VirtualNode}
     */
    let bootstrapVirtualNode;
    
    if (!(containerVirtualNode = getAttachedVirtualNode(container))) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        containerVirtualNode = new VirtualNode(''); // Don't need to care about type of the container
        containerVirtualNode.path_ = getContainerId(container);
        containerVirtualNode.ns_ = ('ownerSVGElement' in container) ? NS_SVG : NS_HTML;
        linkNativeNode(containerVirtualNode, container);
        attachVirtualNode(container, containerVirtualNode);
        
        bootstrapVirtualNode = new VirtualNode(props => props.children);
        appendChildVirtualNode(containerVirtualNode, bootstrapVirtualNode, 0);
        resolveVirtualTree(containerVirtualNode);
    } else {
        bootstrapVirtualNode = containerVirtualNode.children_[0];
    }
    
    bootstrapVirtualNode.props_.children = [root];
    updateVirtualTree(bootstrapVirtualNode);
}
