import {isFunction} from './Util';
import {escapeVirtualNodeKey} from './Path';
import {getFunctionalTypeAlias} from './Externals';

export function resolveVirtualTree(rootVirtualNode) {
    let currentPath = [...rootVirtualNode.path];

    const walk = (virtualNode) => {
        const pivotPathSize = currentPath.length;

        if (virtualNode !== rootVirtualNode) {
            // If a node has key, replace the index of this node
            // in the children node list of the parent
            // by the key
            if (virtualNode.key !== null) {
                currentPath.push(escapeVirtualNodeKey(virtualNode.key));
            } else {
                currentPath.push(virtualNode.posInRow);
            }

            // Add the component type to the current path
            if (isFunction(virtualNode.type)) {
                currentPath.push(getFunctionalTypeAlias(virtualNode.type));
            } else {
                currentPath.push(virtualNode.type);
            }
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
