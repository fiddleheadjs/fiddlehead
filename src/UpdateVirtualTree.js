import {pathToString} from './Path';
import {isFunction} from './Util';
import {unlinkMemoizedHooks} from './MemoizedHooks';
import {resolveVirtualTree} from './ResolveVirtualTree';
import {flushCurrentlyProcessing, prepareCurrentlyProcessing} from './CurrentlyProcessing';
import {
    appendChildVirtualNode,
    createVirtualNodeFromContent,
    NODE_ARRAY,
    NODE_FRAGMENT,
    NODE_TEXT
} from './VirtualNode';
import {hydrateVirtualTree} from './HydrateVirtualTree';
import {commitView} from './CommitView';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {boolean} initial
 */
export function updateVirtualTree(rootVirtualNode, initial) {
    // Update virtual tree and create node maps
    const [oldViewableVirtualNodeMap, oldFunctionalVirtualNodeMap]
        = initial ? [new Map(), new Map()] : _getVirtualNodeMaps(rootVirtualNode);
    _updateVirtualNodeRecursive(rootVirtualNode);
    const [newViewableVirtualNodeMap, newFunctionalVirtualNodeMap] = _getVirtualNodeMaps(rootVirtualNode);

    // Resolve effects and commit view
    _resolveUnmountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitView(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    _resolveMountedVirtualNodes(oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap);
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type_ === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type_)) {
        for (let i = 0; i < virtualNode.children_.length; i++) {
            _updateVirtualNodeRecursive(virtualNode.children_[i]);
        }
        return;
    }

    prepareCurrentlyProcessing(virtualNode);
    const newVirtualNode = createVirtualNodeFromContent(
        virtualNode.type_(virtualNode.props_)
    );
    flushCurrentlyProcessing();

    if (newVirtualNode !== null) {
        appendChildVirtualNode(virtualNode, newVirtualNode, 0);

        // This step aimed to read memoized hooks and restore them
        resolveVirtualTree(virtualNode);

        // Recursion
        _updateVirtualNodeRecursive(newVirtualNode);
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

function _getVirtualNodeMaps(rootVirtualNode) {
    const [outputViewableVirtualMap, outputFunctionalVirtualMap] = [new Map(), new Map()];
    _walkVirtualNode(rootVirtualNode, outputFunctionalVirtualMap, outputViewableVirtualMap);
    
    return [outputViewableVirtualMap, outputFunctionalVirtualMap];
}

function _walkVirtualNode(virtualNode, outputFunctionalVirtualMap, outputViewableVirtualMap) {
    if (isFunction(virtualNode.type_)) {
        outputFunctionalVirtualMap.set(pathToString(virtualNode.path_), virtualNode);
    } else if (virtualNode.type_ !== NODE_ARRAY && virtualNode.type_ !== NODE_FRAGMENT) {
        outputViewableVirtualMap.set(pathToString(virtualNode.path_), virtualNode);
    }

    for (let i = 0; i < virtualNode.children_.length; i++) {
        _walkVirtualNode(virtualNode.children_[i], outputFunctionalVirtualMap, outputViewableVirtualMap);
    }
}
