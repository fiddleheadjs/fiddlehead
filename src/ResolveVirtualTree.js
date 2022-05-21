import {TAG_FUNCTIONAL, escapeVirtualNodeKey, NS_HTML, NS_SVG, PATH_SEP} from './VirtualNode';
import {getFunctionalTypeAlias} from './Externals';
import {findMemoizedHooks, linkMemoizedHooks} from './MemoizedHooks';
import {StateHook} from './StateHook';

export const resolveVirtualTree = (rootVirtualNode) => {
    for (
        let i = 0, len = rootVirtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_, i);
    }
}

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
const _resolveVirtualNodeRecursive = (virtualNode, parentPath, posInRow) => {
    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (virtualNode.key_ !== null
            ? escapeVirtualNodeKey(virtualNode.key_)
            : posInRow)
        + PATH_SEP
        + (virtualNode.tag_ === TAG_FUNCTIONAL
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

    // Restore memoized states
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (
                let hook, i = 0, len = virtualNode.hooks_.length
                ; i < len
                ; ++i
            ) {
                hook = virtualNode.hooks_[i];

                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }

    // Namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_, i);
    }
}

const _determineNS = (virtualNode) => {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NS_SVG;
    }
 
    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.ns_ === NS_SVG && virtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }
    
    // By default, pass namespace below.
    return virtualNode.parent_.ns_;
}
