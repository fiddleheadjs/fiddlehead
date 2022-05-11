import {linkViewNode, NODE_FRAGMENT, NODE_TEXT, NS_HTML, NS_SVG} from "./VirtualNode";
import {createViewElementWithNS, createViewTextNode} from "./ViewManipulation";
import {isFunction, isString} from "./Util";
import {AppendInfo, clearAppendInfoCollection, cloneAppendInfoCollection} from "./AppendInfo";
import {escapeKey} from "./Path";
import {attachVirtualNode, getComponentType} from "./ExternalAttachment";

export function resolveVirtualTree(rootVirtualNode, basePath = []) {
    const rootAppendInfo = new AppendInfo(null, [], rootVirtualNode);
    let appendInfoCollection = cloneAppendInfoCollection();
    let currentPath = [...basePath];

    /**
     *
     * @param {AppendInfo} appendInfo
     * @param {VirtualNode} virtualNode
     */
    const walk = (appendInfo, virtualNode) => {
        const pivotPathSize = currentPath.length;

        if (virtualNode !== rootVirtualNode) {
            currentPath.push(...appendInfo.routeFromParent);

            // If a node has key, replace the index of this node
            // in the children node list of the parent
            // by the key
            if (virtualNode.key !== null) {
                currentPath.pop();
                currentPath.push(escapeKey(virtualNode.key));
            }

            // Add the component type to the current path
            if (isFunction(virtualNode.type)) {
                currentPath.push(getComponentType(virtualNode.type));
            } else {
                currentPath.push(virtualNode.type);
            }
        }

        appendInfoCollection = appendInfoCollection.filter(item => {
            if (item.parent === appendInfo.current) {
                walk(item, item.current);
                return false;
            }
            return true;
        });

        virtualNode.path = [...currentPath];
        virtualNode.parent = appendInfo.parent;

        if (virtualNode.resolvePath !== undefined) {
            virtualNode.resolvePath();
            delete virtualNode.resolvePath;
        }

        currentPath.length = pivotPathSize;
    }

    walk(rootAppendInfo, rootVirtualNode);

    return rootVirtualNode;
}

export function didResolveVirtualTree() {
    clearAppendInfoCollection();
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
    virtualNode.children.forEach(childVirtualNode => {
        hydrateVirtualTree(childVirtualNode);
    });
}
