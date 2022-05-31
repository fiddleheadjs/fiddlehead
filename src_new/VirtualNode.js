import {RefHook} from './RefHook';
import {isFunction, isNullish} from './Util';

/**
 * 
 * @param {function|string} type 
 * @param {{}?} props 
 * @param {string|number?} key 
 * @param {RefHook?} ref 
 */
export function VirtualNode(type, props, key, ref) {
    this.type_ = type;

    this.key_ = key === undefined ? null : key;
    
    this.slot_ = null;
    
    this.ns_ = null;

    this.parent_ = null;
    
    this.child_ = null;

    this.sibling_ = null;
    
    this.nativeNode_ = null;

    if (type !== NODE_FRAGMENT) {
        this.props_ = props || {};
        
        if (isFunction(type)) {
            this.hook_ = null;
        } else {
            if (ref instanceof RefHook) {
                this.ref_ = ref;
            }
        }
    }
    
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

export const RootType = (props) => {
    return props.children;
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
export const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (!isNullish(virtualNode.ref_)) {
        virtualNode.ref_.current = nativeNode;
    }
}
