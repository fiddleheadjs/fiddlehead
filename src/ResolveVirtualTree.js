import {isFunction} from './Util';
import {escapeVirtualNodeKey} from './Path';
import {getFunctionalTypeAlias} from './Externals';
import {findMemoizedHooks, linkMemoizedHooks} from './MemoizedHooks';
import {StateHook} from './StateHook';

export function resolveVirtualTree(rootVirtualNode) {
    for (let i = 0; i < rootVirtualNode.children_.length; i++) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_);
    }
}

function _resolveVirtualNodeRecursive(virtualNode, parentPath) {
    // Don't change the passed path
    const currentPath = [...parentPath];

    // If a node has key, replace the index of this node
    // in the children node list of the parent
    // by the key
    if (virtualNode.key_ !== null) {
        currentPath.push(escapeVirtualNodeKey(virtualNode.key_));
    } else {
        currentPath.push(virtualNode.posInRow_);
    }

    // Add the component type to the current path
    if (isFunction(virtualNode.type_)) {
        currentPath.push(getFunctionalTypeAlias(virtualNode.type_));
    } else {
        currentPath.push(virtualNode.type_);
    }

    // Set path
    virtualNode.path_ = currentPath;

    // Restore memoized states
    if (isFunction(virtualNode.type_)) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (let i = 0; i < virtualNode.hooks_.length; i++) {
                const hook = virtualNode.hooks_[i];
                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }
    
    // Recursion
    for (let i = 0; i < virtualNode.children_.length; i++) {
        _resolveVirtualNodeRecursive(virtualNode.children_[i], currentPath);
    }
}
