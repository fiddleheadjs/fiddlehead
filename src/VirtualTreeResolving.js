import {linkViewNode, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from './VirtualNode';
import {createViewElementWithNS, createViewTextNode} from './ViewManipulation';
import {isFunction, isString} from './Util';
import {escapeKey} from './Path';
import {attachVirtualNode, getComponentType} from './ExternalAttachment';

export function resolveVirtualTree(rootVirtualNode) {
    let currentPath = [...rootVirtualNode.path];
    // console.log('***', currentPath.join('/'));

    const walk = (virtualNode) => {
        const pivotPathSize = currentPath.length;

        if (virtualNode !== rootVirtualNode) {
            // console.log('---',currentPath.join('/'));
            currentPath.push(...virtualNode.pathFromParent);

            // If a node has key, replace the index of this node
            // in the children node list of the parent
            // by the key
            if (virtualNode.key !== null) {
                currentPath[currentPath.length - 1] = escapeKey(virtualNode.key);
            }

            // Add the component type to the current path
            if (isFunction(virtualNode.type)) {
                currentPath.push(getComponentType(virtualNode.type));
            } else {
                currentPath.push(virtualNode.type);
            }
            // console.log('>>>',currentPath.join('/'));
        }

        for (let i = 0; i < virtualNode.children.length; i++) {
            walk(virtualNode.children[i]);
        }

        virtualNode.path = [...currentPath];

        if (virtualNode.resolvePath !== undefined) {
            virtualNode.resolvePath();
            delete virtualNode.resolvePath;
        }

        currentPath.length = pivotPathSize;
    }

    walk(rootVirtualNode);
}

export function didResolveVirtualTree() {

}

export function hydrateVirtualTree(virtualNode) {
    // Determine the namespace
    if (virtualNode.type === 'svg') {
        virtualNode.ns = NS_SVG;
    } else {
        if (virtualNode.parent !== null) {
            virtualNode.ns = virtualNode.parent.ns;
        } else {
            virtualNode.ns = NS_HTML;
        }
    }

    // Create the view node
    let viewNode = null;

    if (virtualNode.type === NODE_TEXT) {
        viewNode = createViewTextNode(virtualNode.text);
    } else if (virtualNode.type === NODE_FRAGMENT) {
        // Do nothing here
        // But be careful, removing it changes the condition
    } else if (isString(virtualNode.type)) {
        let viewNS = null;
        if (virtualNode.ns === NS_SVG) {
            viewNS = 'http://www.w3.org/2000/svg';
        }
        viewNode = createViewElementWithNS(viewNS, virtualNode.type, virtualNode.props);

        // For debug
        attachVirtualNode(viewNode, virtualNode);
    }

    linkViewNode(virtualNode, viewNode);

    // Continue with the children
    for (let i = 0; i < virtualNode.children.length; i++) {
        hydrateVirtualTree(virtualNode.children[i]);
    }
}
