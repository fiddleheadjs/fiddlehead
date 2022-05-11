import {isArray, isFunction, isNumber, isString} from './Util';
import {addAppendInfo, AppendInfo} from './AppendInfo';
import {NODE_FRAGMENT, NODE_TEXT, VirtualNode} from './VirtualNode';
import {
    findFunctionalVirtualNode,
    linkFunctionalVirtualNode,
    unlinkFunctionalVirtualNode
} from './FunctionalVirtualNodeMapping';
import {generateTemporaryPath} from './Path';

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
export function createElement(type, attributes, ...content) {
    attributes = attributes || {};

    if (type === null) {
        return _createStaticVirtualNode(NODE_FRAGMENT, attributes, ...content);
    }

    if (isFunction(type)) {
        return _createFunctionalVirtualNode(type, attributes, ...content);
    }

    return _createStaticVirtualNode(type, attributes, ...content);
}

function _createFunctionalVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;
    props.children = content;

    const tempPath = generateTemporaryPath();

    const virtualNode = new VirtualNode(type, props, key, ref);
    linkFunctionalVirtualNode(tempPath, virtualNode);

    virtualNode.resolvePath = () => {
        unlinkFunctionalVirtualNode(tempPath);

        const existing = findFunctionalVirtualNode(virtualNode.path);
        if (existing) {
            virtualNode.hooks = existing.hooks;
        }

        linkFunctionalVirtualNode(virtualNode.path, virtualNode);
    };

    return virtualNode;
}

function _createStaticVirtualNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const virtualNode = new VirtualNode(type, props, key, ref);

    _appendVirtualChildren(virtualNode, content);

    return virtualNode;
}

function _appendVirtualChildren(element, content, indexes = []) {
    if (isArray(content)) {
        for (let i = 0; i < content.length; i++) {
            _appendVirtualChildren(element, content[i], [...indexes, i]);
        }
        return;
    }

    _appendVirtualChild(element, content, indexes);
}

function _appendVirtualChild(element, item, indexes) {
    let virtualNode;

    if (isString(item) || isNumber(item)) {
        virtualNode = new VirtualNode(NODE_TEXT, {}, null, null);
        virtualNode.text = String(item);
    } else {
        virtualNode = item;
    }

    if (virtualNode instanceof VirtualNode) {
        element.children.push(virtualNode);
        addAppendInfo(
            new AppendInfo(element, indexes, virtualNode)
        );
    }
}
