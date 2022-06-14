// Do not support namespace MathML as almost browsers do not support as well
export const NAMESPACE_HTML = 0;
export const NAMESPACE_SVG = 1;

// Special node types
export const TextNode = '#';
export const Fragment = '[';
export function Portal(props) {
    return props.children;
}

/**
 * 
 * @param {function|string} type
 * @param {{}|string|null} props
 */
export function VirtualNode(type, props) {
    // Identification
    // ==============

    /**
     * @type {string|function}
     */
    this.type_ = type;

    /**
     * @type {string|null}
     */
    this.key_ = null;

    /**
     * @type {number|null}
     */
    this.slot_ = null;

    // Props and hooks
    // ===============

    /**
     * @type {{}|string|null}
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

    /**
     * @type {Ref|null}
     */
    this.ref_ = null;

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

    // Temporary properties
    // ====================
    
    // The previous version of this node
    /**
     * @type {VirtualNode|null}
     */
    this.alternate_ = null;

    // The children (and their subtrees, of course) are marked to be deleted
    /**
     * @type {VirtualNode[]}
     */
    this.deletions_ = null;

    // Insertion flag
    // To be used to optimize the painting process
    /**
     * @type {number|null}
     */
    this.insertion_ = null;
 
    // If this node is a mounting point, this property tracks the native child
    // that will be used as the reference node to insert the new child after it
    /**
     * @type {Node|null}
     */
    this.mountingRef_ = null;
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
export function linkNativeNode(virtualNode, nativeNode) {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ !== null) {
        virtualNode.ref_.current = nativeNode;
    }
}
