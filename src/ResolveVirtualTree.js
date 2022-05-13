import {isFunction} from './Util';
import {escapeVirtualNodeKey, PATH_SEP} from './Path';
import {getFunctionalTypeAlias} from './Externals';
import {findMemoizedHooks, linkMemoizedHooks} from './MemoizedHooks';
import {StateHook} from './StateHook';

export function resolveVirtualTree(rootVirtualNode) {
    for (let i = 0; i < rootVirtualNode.children_.length; i++) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_);
    }
}

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
function _resolveVirtualNodeRecursive(virtualNode, parentPath) {
    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (virtualNode.key_ !== null
            ? escapeVirtualNodeKey(virtualNode.key_)
            : virtualNode.posInRow_)
        + PATH_SEP
        + (isFunction(virtualNode.type_)
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

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
        _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_);
    }
}
