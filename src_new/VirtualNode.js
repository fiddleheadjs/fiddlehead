import {RefHook} from './RefHook';

/**
 * 
 * @param {function|string} type 
 * @param {{}|string?} props: required for text nodes
 * @param {string|number?} key 
 * @param {RefHook?} ref 
 */
export function VirtualNode(type, props, key = null, ref = null) {
    // Identification
    // ==============

    this.type_ = type;

    this.key_ = key;

    this.slot_ = null;

    // Props and hooks
    // ===============

    // With a text node, props will be the content string
    this.props_ = type === NODE_FRAGMENT ? null : (
        props !== undefined ? props : {}
    );

    this.hook_ = null;
    
    // Namespace, output native node, ref
    // ==================================

    this.ns_ = null;
    
    this.nativeNode_ = null;
    
    this.ref_ = ref;

    // Linked-list pointers
    // ====================

    this.parent_ = null;
    
    this.child_ = null;

    this.sibling_ = null;

    // Temp props
    // ==========
    
    // The previous version of this node
    this.alternative_ = null;

    // The children (and their subtrees, of course) are marked to be deleted
    this.deletions_ = null;

    // In the commit phase, the new child will be inserted
    // after the last inserted/updated child
    this.lastCommittedNativeChild_ = null;
}

// Do not support namespace MathML as almost browsers do not support as well
export const NS_HTML = 0;
export const NS_SVG = 1;

// Note:
// Use special URI characters

export const NODE_TEXT = '#';
export const NODE_FRAGMENT = '[';

export const Root = (props) => {
    return props.children;
}

export const Fragment = () => {
    // Do nothing here
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
export const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ instanceof RefHook) {
        virtualNode.ref_.current = nativeNode;
    }
}
