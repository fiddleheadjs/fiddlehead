import {resolveVirtualTree} from './VirtualTreeResolving';
import {linkViewNode, NS_HTML, NS_SVG, VirtualNode} from './VirtualNode';
import {updateVirtualTree} from './VirtualTreeUpdating';
import {getContainerId} from './ExternalAttachment';

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

    linkViewNode(containerVirtualNode, container);

    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    rootVirtualNode.parent = containerVirtualNode;
    rootVirtualNode.posInRow = 0;
    containerVirtualNode.children[0] = rootVirtualNode;
    containerVirtualNode.path = [getContainerId(container)];

    resolveVirtualTree(containerVirtualNode);
    
    updateVirtualTree(rootVirtualNode, true);
}
