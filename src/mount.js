import {didResolveVirtualTree, resolveVirtualTree} from './VirtualTreeResolving';
import {linkViewNode, NS_HTML, NS_SVG, VirtualNode} from './VirtualNode';
import {updateVirtualTree} from './VirtualTreeUpdating';
import {getContainerId} from './ExternalAttachment';
import {addAppendInfo, AppendInfo} from './AppendInfo';

export function mount(rootVirtualNode, container) {
    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);
    linkViewNode(containerVirtualNode, container);
    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    containerVirtualNode.children[0] = rootVirtualNode;
    rootVirtualNode.parent = containerVirtualNode;
    addAppendInfo(
        new AppendInfo(containerVirtualNode, [0], rootVirtualNode)
    );
    console.log('--', rootVirtualNode.parent);
    
    resolveVirtualTree(containerVirtualNode, [getContainerId(container)]);
    didResolveVirtualTree();
    
    updateVirtualTree(rootVirtualNode, true);
    console.log('--', rootVirtualNode.parent, containerVirtualNode.children);
}
