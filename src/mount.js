import {didResolveVirtualTree, resolveVirtualTree} from './VirtualTreeResolving';
import {linkViewNode, NS_HTML, NS_SVG, VirtualNode} from './VirtualNode';
import {updateVirtualTree} from './VirtualTreeUpdating';
import {getContainerId} from './ExternalAttachment';

export function mount(rootVirtualNode, container) {
    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);

    linkViewNode(containerVirtualNode, container);

    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    containerVirtualNode.path = [getContainerId(container)];
    containerVirtualNode.children[0] = rootVirtualNode;
    rootVirtualNode.parent = containerVirtualNode;
    rootVirtualNode.pathFromParent = [0];
    
    resolveVirtualTree(containerVirtualNode);
    didResolveVirtualTree();
    
    updateVirtualTree(rootVirtualNode, true);
}
