import {isFunction} from './Util';
import {escapeVirtualNodeKey} from './Path';
import {getFunctionalTypeAlias} from './Externals';
import {findMemoizedHooks, linkMemoizedHooks} from './MemoizedHooks';
import {StateHook} from './StateHook';

export function resolveVirtualTree(rootVirtualNode) {
    for (let i = 0; i < rootVirtualNode.children.length; i++) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children[i], rootVirtualNode.path);
    }
}

function _resolveVirtualNodeRecursive(virtualNode, parentPath) {
    // Don't change the passed path
    const currentPath = [...parentPath];

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

    // Set path
    virtualNode.path = currentPath;

    // Restore memoized states
    if (isFunction(virtualNode.type)) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks = memoizedHooks;

            for (let i = 0; i < virtualNode.hooks.length; i++) {
                const hook = virtualNode.hooks[i];
                if (hook instanceof StateHook) {
                    hook.context = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path, virtualNode.hooks);
    }
    
    // Recursion
    for (let i = 0; i < virtualNode.children.length; i++) {
        _resolveVirtualNodeRecursive(virtualNode.children[i], currentPath);
    }
}
