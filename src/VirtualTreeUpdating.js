import {stringifyPath} from './Path';
import {hasOwnProperty, isFunction} from './Util';
import {unlinkFunctionalVirtualNode} from './FunctionalVirtualNodeMapping';
import {didResolveVirtualTree, hydrateVirtualTree, resolveVirtualTree} from './VirtualTreeResolving';
import {flushCurrentlyRendering, prepareCurrentlyRendering} from './CurrentlyProcessing';
import {NODE_TEXT} from './VirtualNode';
import {commitView} from './ViewCommitment';
import {destroyEffectsOnFunctionalVirtualNode, mountEffectsOnFunctionalVirtualNode} from './EffectHook';
import {addAppendInfo, AppendInfo} from './AppendInfo';

/**
 *
 * @param {VirtualNode} rootVirtualNode
 * @param {boolean} initial
 */
export function updateVirtualTree(rootVirtualNode, initial) {
    const oldVirtualNodeMap = initial ? {} : _getVirtualNodeMap(rootVirtualNode);
    _updateVirtualNode(rootVirtualNode);
    const newVirtualNodeMap = _getVirtualNodeMap(rootVirtualNode);

    console.log('----');
    console.log(rootVirtualNode.type.name, rootVirtualNode);
    console.log({oldVirtualNodeMap, newVirtualNodeMap});
    console.log(Object.keys(oldVirtualNodeMap).length, Object.keys(newVirtualNodeMap).length);
    console.log(Object.keys(oldVirtualNodeMap).join('\n') === Object.keys(newVirtualNodeMap).join('\n'));

    _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
    hydrateVirtualTree(rootVirtualNode);
    commitView(oldVirtualNodeMap, newVirtualNodeMap);
    _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNode(virtualNode) {
    _updateVirtualNodeRecursive(virtualNode);
    didResolveVirtualTree();
}

/**
 *
 * @param {VirtualNode} virtualNode
 */
function _updateVirtualNodeRecursive(virtualNode) {
    if (virtualNode.type === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type)) {
        for (let i = 0; i < virtualNode.children.length; i++) {
            _updateVirtualNodeRecursive(virtualNode.children[i]);
        }
        return;
    }

    {
        prepareCurrentlyRendering(virtualNode);
        const newVirtualNode = virtualNode.type(virtualNode.props);
        flushCurrentlyRendering();

        virtualNode.children[0] = newVirtualNode;
        // newVirtualNode.parent = virtualNode;
        addAppendInfo(
            new AppendInfo(virtualNode, [0], newVirtualNode)
        );

        // 0 is the position of the new one
        resolveVirtualTree(virtualNode, virtualNode.path.slice(0, virtualNode.path.length - 1));

        // newVirtualNode.parent = virtualNode;
        // virtualNode.children[0] = newVirtualNode;

        _updateVirtualNodeRecursive(newVirtualNode);
    }
}

function _resolveUnmountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

                if (unmounted) {
                    unlinkFunctionalVirtualNode(virtualNode.path);
                }
            }
        }
    }
}

function _resolveMountedVirtualNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            const mounted = !hasOwnProperty(oldVirtualNodeMap, key);
            const virtualNode = newVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
            }
        }
    }
}

function _getVirtualNodeMap(rootVirtualNode) {
    const out = Object.create(null);

    const walk = (virtualNode) => {
        out[stringifyPath(virtualNode.path)] = virtualNode;

        for (let i = 0; i < virtualNode.children.length; i++) {
            walk(virtualNode.children[i]);
        }
    };

    walk(rootVirtualNode);

    return out;
}

window._getVirtualNodeMap = _getVirtualNodeMap;