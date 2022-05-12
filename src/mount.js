import {resolveVirtualTree} from './ResolveVirtualTree';
import {linkNativeNode, NS_HTML, NS_SVG, VirtualNode} from './VirtualNode';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getContainerId} from './Externals';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {Element} container
 */
export function mount(rootVirtualNode, container) {
    if (container.firstChild) {
        throw new Error('Container must be empty');
    }

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);

    linkNativeNode(containerVirtualNode, container);
    attachVirtualNode(container, containerVirtualNode);

    if (container.ownerSVGElement) {
        containerVirtualNode.ns_ = NS_SVG;
    } else {
        containerVirtualNode.ns_ = NS_HTML;
    }

    rootVirtualNode.parent_ = containerVirtualNode;
    rootVirtualNode.posInRow_ = 0;
    containerVirtualNode.children_[0] = rootVirtualNode;
    containerVirtualNode.path_ = [getContainerId(container)];

    resolveVirtualTree(containerVirtualNode);
    
    updateVirtualTree(rootVirtualNode, true);
}
