import {resolveVirtualTree} from './ResolveVirtualTree';
import {appendChildVirtualNode, createVirtualNodeFromContent, linkNativeNode, NS_HTML, NS_SVG, VirtualNode} from './VirtualNode';
import {updateVirtualTree} from './UpdateVirtualTree';
import {attachVirtualNode, getContainerId} from './Externals';

/**
 *
 * @param {*} root
 * @param {Element} container
 */
export function mount(root, container) {
    if (container.firstChild) {
        throw new Error('Container must be empty');
    }

    const rootVirtualNode = createVirtualNodeFromContent(root);

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);
    containerVirtualNode.path_ = getContainerId(container);
    containerVirtualNode.ns_ = container.ownerSVGElement ? NS_SVG : NS_HTML;
    linkNativeNode(containerVirtualNode, container);
    attachVirtualNode(container, containerVirtualNode);

    appendChildVirtualNode(containerVirtualNode, rootVirtualNode, 0);

    resolveVirtualTree(containerVirtualNode);
    updateVirtualTree(rootVirtualNode, true);
}
