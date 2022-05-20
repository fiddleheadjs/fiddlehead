import {unlinkMemoizedHooks} from './MemoizedHooks';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {flushCurrentlyProcessing, prepareCurrentlyProcessing} from './CurrentlyProcessing';
import {appendChildVirtualNode, TAG_FUNCTIONAL, TAG_VIEWABLE, createVirtualNodeFromContent} from './VirtualNode';
import {commitView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 */
export function updateVirtualTree(rootVirtualNode) {
    // Update virtual tree and create node maps
    const oldTypedVirtualNodeMaps = _getVirtualNodeMaps(rootVirtualNode);
    const newTypedVirtualNodeMaps = _updateVirtualTreeImpl(rootVirtualNode);

    // Resolve effects and commit view
    _resolveUnmountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
    commitView(oldTypedVirtualNodeMaps.viewable_, newTypedVirtualNodeMaps.viewable_);
    _resolveMountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
}

function _updateVirtualTreeImpl(rootVirtualNode) {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _updateVirtualNodeRecursive(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

function _updateVirtualNodeRecursive(virtualNode, typedVirtualNodeMaps) {
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    
        prepareCurrentlyProcessing(virtualNode);
        const newVirtualNode = createVirtualNodeFromContent(
            virtualNode.type_(virtualNode.props_)
        );
        flushCurrentlyProcessing();
    
        if (newVirtualNode !== null) {
            appendChildVirtualNode(virtualNode, newVirtualNode, 0);
    
            // This step aimed to read memoized hooks and restore them
            // Memoized data affects the underneath tree,
            // so don't wait until the recursion finished to do this
            resolveVirtualTree(virtualNode);
        }
    } else if (virtualNode.tag_ === TAG_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _updateVirtualNodeRecursive(virtualNode.children_[i], typedVirtualNodeMaps);
    }
}

function _createEmptyTypedVirtualNodeMaps() {
    return {
        functional_: new Map(),
        viewable_: new Map(),
    };
}

function _getVirtualNodeMaps(rootVirtualNode) {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _walkVirtualNode(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

function _walkVirtualNode(virtualNode, typedVirtualNodeMaps) {
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    } else if (virtualNode.tag_ === TAG_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _walkVirtualNode(virtualNode.children_[i], typedVirtualNodeMaps);
    }
}

function _resolveUnmountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) {
    oldFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const unmounted = !newFunctionalVirtualNodeMap.has(key);

        destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

        if (unmounted) {
            unlinkMemoizedHooks(virtualNode.path_);
        }
    });
}

function _resolveMountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) {
    newFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const mounted = !oldFunctionalVirtualNodeMap.has(key);
        mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
    });
}
