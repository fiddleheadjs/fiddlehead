import {Ref} from './RefHook';
import {isNullish} from './Util';

/**
 * 
 * @param {function|string} type
 * @param {{}} props
 * @param {string|null?} key
 */
export function VirtualNode(type, props, key) {
    // Identification
    // ==============

    this.type_ = type;

    // Convert to string to avoid conflict with slot
    this.key_ = !isNullish(key) ? ('' + key) : null;

    this.slot_ = null;

    // Props and hooks
    // ===============

    if (!(props.ref === undefined || props.ref instanceof Ref)) {
        // Delete the invalid ref
        delete props.ref;
        
        if (__DEV__) {
            console.error('The ref value must be created by the useRef hook');
        }
    }
    this.props_ = props;

    this.refHook_ = null;
    
    this.stateHook_ = null;

    this.effectHook_ = null;
    
    // Output native node and relates
    // ==============================
    
    this.nativeNode_ = null;

    this.ns_ = null;

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
    this.lastManipulatedClientNativeNode_ = null;
}

// Do not support namespace MathML as almost browsers do not support as well
export const NS_HTML = 0;
export const NS_SVG = 1;

// Special node types
export const TextNode = '#';
export const Fragment = '[';
export function Portal(props) {
    return props.children;
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
export function linkNativeNode(virtualNode, nativeNode) {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.props_.ref !== undefined) {
        virtualNode.props_.ref.current = nativeNode;
    }
}
