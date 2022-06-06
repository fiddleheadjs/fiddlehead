// Do not support namespace MathML as almost browsers do not support as well
export const NAMESPACE_HTML = 0;
export const NAMESPACE_SVG = 1;

// Special node types
export const TextNode = '#';
export const Fragment = '[';
export function Portal(props) {
    // Return props instead of props.children
    // This is a trick to allow setting props to null
    // in order to save memory
    return props;
}

/**
 * 
 * @param {function|string} type
 * @param {{}|null} props
 * @param {string|null} key
 */
export function VirtualNode(type, props, key) {
    // Identification
    // ==============

    /**
     * @type {string|function}
     */
    this.type_ = type;

    /**
     * @type {string|null}
     */
    this.key_ = key;

    /**
     * @type {number|null}
     */
    this.slot_ = null;

    // Props and hooks
    // ===============

    /**
     * @type {{}|null}
     */
    this.props_ = props;

    /**
     * @type {RefHook|null}
     */
    this.refHook_ = null;
    
    /**
     * @type {StateHook|null}
     */
    this.stateHook_ = null;

    /**
     * @type {EffectHook|null}
     */
    this.effectHook_ = null;
    
    // Output native node and relates
    // ==============================
    
    /**
     * @type {Node}
     */
    this.nativeNode_ = null;

    /**
     * @type {string|null}
     */
    this.namespace_ = null;

    // Linked-list pointers
    // ====================

    /**
     * @type {VirtualNode|null}
     */
    this.parent_ = null;
    
    /**
     * @type {VirtualNode|null}
     */
    this.child_ = null;

    /**
     * @type {VirtualNode|null}
     */
    this.sibling_ = null;

    // Temp props
    // ==========
    
    // The previous version of this node
    /**
     * @type {VirtualNode|null}
     */
    this.alternative_ = null;

    // The children (and their subtrees, of course) are marked to be deleted
    /**
     * @type {VirtualNode[]}
     */
    this.deletions_ = null;
 
    // In the commit phase, the new child will be inserted
    // after the last inserted/updated child
    /**
     * @type {Node|null}
     */
    this.lastManipulatedClient_ = null;
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
