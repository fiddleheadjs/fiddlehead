import {isFunction} from './Util';
import {appendChildVirtualNode, createVirtualNodeFromContent, NODE_FRAGMENT, VirtualNode} from './VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
export function createElement(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes || {};

    const virtualNode = new VirtualNode(type);
    
    virtualNode.props_ = props;
    virtualNode.key_ = key;
    virtualNode.ref_ = ref;

    if (isFunction(type)) {
        // JSX children
        virtualNode.props_.children = content;
    } else {
        // Append children directly
        let i = 0, posInRow = -1;
        for (i = 0; i < content.length; i++) {
            const childNode = createVirtualNodeFromContent(content[i]);
            if (childNode !== null) {
                appendChildVirtualNode(virtualNode, childNode, ++posInRow);
            }
        }
    }

    return virtualNode;
}
