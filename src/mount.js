import {finishResolveVirtualTree, resolveVirtualTree} from "./VirtualTreeResolving";
import {getContainerId} from "./misc";
import {linkViewNode, NS_HTML, NS_SVG, VirtualNode} from "./VirtualNode";
import {updateVirtualTree} from "./VirtualTreeUpdating";

export function mount(rootVirtualNode, container) {
    resolveVirtualTree(rootVirtualNode, [getContainerId(container)]);
    finishResolveVirtualTree();

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);

    linkViewNode(containerVirtualNode, container);

    rootVirtualNode.parent = containerVirtualNode;

    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    updateVirtualTree(rootVirtualNode, true);
}
