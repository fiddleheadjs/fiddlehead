import {appendChildVirtualNode, CLASS_FUNCTIONAL, createVirtualNodeFromContent, VirtualNode} from './VirtualNode';

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

    if (virtualNode.class_ === CLASS_FUNCTIONAL) {
        // JSX children
        virtualNode.props_.children = content.length > 1 ? content : content[0];
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
