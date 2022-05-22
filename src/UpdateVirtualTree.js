import {unlinkMemoizedHooks} from './MemoizedHooks';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {flushCurrentlyProcessing, prepareCurrentlyProcessing} from './CurrentlyProcessing';
import {createVirtualNodeFromContent} from './VirtualNode';
import {commitView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {isFunction} from './Util';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 */
export const updateVirtualTree = (rootVirtualNode) => {
    // Update virtual tree and create node maps
    const oldTypedVirtualNodeMaps = _getVirtualNodeMaps(rootVirtualNode);
    const newTypedVirtualNodeMaps = _updateVirtualTreeImpl(rootVirtualNode);

    // Resolve effects and commit view
    _resolveUnmountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
    commitView(oldTypedVirtualNodeMaps.viewable_, newTypedVirtualNodeMaps.viewable_);
    _resolveMountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
}

const _updateVirtualTreeImpl = (rootVirtualNode) => {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _updateVirtualNodeRecursive(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

const _updateVirtualNodeRecursive = (virtualNode, typedVirtualNodeMaps) => {
    if (isFunction(virtualNode.type_)) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    
        prepareCurrentlyProcessing(virtualNode);
        const newVirtualNode = createVirtualNodeFromContent(
            virtualNode.type_(virtualNode.props_)
        );
        flushCurrentlyProcessing();
    
        if (newVirtualNode !== null) {
            virtualNode.children_[0] = newVirtualNode;
            newVirtualNode.parent_ = virtualNode;
    
            // This step aimed to read memoized hooks and restore them
            // Memoized data affects the underneath tree,
            // so don't wait until the recursion finished to do this
            resolveVirtualTree(virtualNode);
        }
    } else if (virtualNode.nativeNode_ !== undefined) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    if (virtualNode.children_ !== undefined) {
        // Recursion
        for (
            let i = 0, len = virtualNode.children_.length
            ; i < len
            ; ++i
        ) {
            _updateVirtualNodeRecursive(virtualNode.children_[i], typedVirtualNodeMaps);
        }
    }
}

const _createEmptyTypedVirtualNodeMaps = () => {
    return {
        functional_: new Map(),
        viewable_: new Map(),
    };
}

const _getVirtualNodeMaps = (rootVirtualNode) => {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _walkVirtualNode(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
}

const _walkVirtualNode = (virtualNode, typedVirtualNodeMaps) => {
    if (isFunction(virtualNode.type_)) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    } else if (virtualNode.nativeNode_ !== undefined) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    if (virtualNode.children_ !== undefined) {
        for (
            let i = 0, len = virtualNode.children_.length
            ; i < len
            ; ++i
        ) {
            _walkVirtualNode(virtualNode.children_[i], typedVirtualNodeMaps);
        }
    }
}

const _resolveUnmountedVirtualNodes = (oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) => {
    oldFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const unmounted = !newFunctionalVirtualNodeMap.has(key);

        destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

        if (unmounted) {
            unlinkMemoizedHooks(virtualNode.path_);
        }
    });
}

const _resolveMountedVirtualNodes = (oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) => {
    newFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const mounted = !oldFunctionalVirtualNodeMap.has(key);

        mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
    });
}
