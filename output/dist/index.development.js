'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const hasOwnProperty = (obj, propName) => {
    return Object.prototype.hasOwnProperty.call(obj, propName);
};

const isString = (value) => {
    return typeof value === 'string'/* || value instanceof String*/;
};

const isNumber = (value) => {
    return typeof value === 'number'/* || value instanceof Number*/;
};

const isFunction = (value) => {
    return typeof value === 'function';
};

const isArray = (value) => {
    return value instanceof Array;
};

const isNullish = (value) => {
    return value === null || value === undefined;
};

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 * @returns {boolean}
 */
const compareArrays = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

let currentNode = null;
let currentHook = null;

const prepareCurrentlyProcessing = (functionalVirtualNode) => {
    currentNode = functionalVirtualNode;
};

const flushCurrentlyProcessing = () => {
    currentNode = null;
    currentHook = null;
};

const resolveCurrentHook = (createHookFn, processFn) => {
    if (currentNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    if (currentHook === null) {
        if (currentNode.hook_ === null) {
            currentHook = createHookFn(currentNode);
            currentNode.hook_ = currentHook;
        } else {
            currentHook = currentNode.hook_;
        }
    } else {
        if (currentHook.next_ === null) {
            const previousHook = currentHook;           
            currentHook = createHookFn(currentNode);
            previousHook.next_ = currentHook;
        } else {
            currentHook = currentHook.next_;
        }
    }

    return processFn(currentHook);
};

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.current = current;
    this.next_ = null;
}

const useRef = (initialValue) => {
    return resolveCurrentHook(
        (currentNode) => new RefHook(initialValue),
        (currentHook) => currentHook
    );
};

/**
 * 
 * @param {function|string|number} type
 * @param {{}|string?} props: required for text nodes
 * @param {string|number?} key
 * @param {RefHook?} ref
 */
function VirtualNode(type, props, key = null, ref = null) {
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
    
    // Native node and relates
    // =======================
    
    this.nativeNode_ = null;

    this.ns_ = null;
    
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
const NS_HTML = 0;
const NS_SVG = 1;

// Note:
// Use special URI characters

const NODE_TEXT = 0;
const NODE_FRAGMENT = 1;

const Root = (props) => {
    return props.children;
};

const Fragment = () => {
    // Do nothing here
};

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ instanceof RefHook) {
        virtualNode.ref_.current = nativeNode;
    }
};

/**
 *
 * @param {string|function} type
 * @param {{}|null} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
const createElement = (type, attributes, ...content) => {
    const {key, ref, ...props} = attributes || {};

    if (type === Fragment) {
        type = NODE_FRAGMENT;
    }

    const virtualNode = new VirtualNode(type, props, key, ref);

    if (isFunction(type)) {
        // JSX children
        if (content.length > 0) {
            virtualNode.props_.children = content.length > 1 ? content : content[0];
        }
    } else {
        // Append children directly
        _appendChildrenFromContent(virtualNode, content);
    }

    return virtualNode;
};

/**
 *
 * @param {*} content
 * @return {null|VirtualNode}
 */
 const createVirtualNodeFromContent = (content) => {
    if (content instanceof VirtualNode) {
        return content;
    }
        
    if (isString(content) || isNumber(content)) {
        return new VirtualNode(NODE_TEXT, content);
    }

    if (isArray(content)) {
        const node = new VirtualNode(NODE_FRAGMENT);
        _appendChildrenFromContent(node, content);
        return node;
    }

    return null;
};

/**
 * 
 * @param {VirtualNode} parentNode 
 * @param {Array} content
 */
const _appendChildrenFromContent = (parentNode, content) => {
    for (
        let childNode, prevChildNode = null, i = 0, len = content.length
        ; i < len
        ; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        
        if (childNode !== null) {
            childNode.parent_ = parentNode;
            childNode.slot_ = i;

            if (prevChildNode !== null) {
                prevChildNode.sibling_ = childNode;
            } else {
                parentNode.child_ = childNode;
            }

            prevChildNode = childNode;
        }
    }
};

const PROP_VNODE = '%vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
const attachVirtualNode = (nativeNode, virtualNode) => {
    nativeNode[PROP_VNODE] = virtualNode;
};

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
const extractVirtualNode = (nativeNode) => {
    return nativeNode[PROP_VNODE];
};

const updateNativeElementAttributes = (element, newAttributes, oldAttributes) => {
    _updateKeyValues(
        element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
};

const _updateElementAttribute = (element, attrName, newAttrValue, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element.style, newAttrValue, oldAttrValue || {});
        return;
    }

    if (isString(newAttrValue) || isNumber(newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        return;
    }

    // Cases: properties, event listeners
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            if (true) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
        }
    }
};

const _removeElementAttribute = (element, attrName, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (isString(oldAttrValue) || isNumber(oldAttrValue)) {
        element.removeAttribute(attrName);
        return;
    }

    // Cases: properties, event listeners
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            if (true) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
        }
    }
};

const _normalizeElementAttributeName = (attrName) => {
    if (attrName === 'class') {
        if (true) {
            console.error('Use `className` instead of `class`');
        }
        return '';
    }

    if (attrName === 'className') {
        return 'class';
    }

    if (/^on[A-Z]/.test(attrName)) {
        return attrName.toLowerCase();
    }

    return attrName;
};

const _updateStyleProperties = (style, newProperties, oldProperties) => {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
};

const _updateStyleProperty = (style, propName, newPropValue) => {
    style[propName] = newPropValue;
};

const _removeStyleProperty = (style, propName) => {
    style[propName] = '';
};

const _updateKeyValues = (target, newKeyValues, oldKeyValues, updateFn, removeFn) => {
    let key;
    
    for (key in oldKeyValues) {
        if (_hasOwnNonEmpty(oldKeyValues, key)) {
            if (!_hasOwnNonEmpty(newKeyValues, key)) {
                removeFn(target, key, oldKeyValues[key]);
            }
        }
    }

    for (key in newKeyValues) {
        if (_hasOwnNonEmpty(newKeyValues, key)) {
            updateFn(target, key, newKeyValues[key], oldKeyValues[key]);
        }
    }
};

const _hasOwnNonEmpty = (target, prop) => {
    return hasOwnProperty(target, prop) && !isNullish(target[prop]);
};

const createNativeTextNode = (text) => {
    return document.createTextNode(text);
};

const updateNativeTextNode = (node, text) => {
    node.textContent = text;
};

const createNativeElementWithNS = (ns, type, attributes) => {
    const element = (ns === NS_SVG
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type)
    );

    updateNativeElementAttributes(element, attributes, {});
    
    return element;
};

// Important Note
// This module does not handle RootType

const hydrateView = (virtualNode) => {
    virtualNode.ns_ = _determineNS(virtualNode);

    // Do nothing more with fragments
    if (_isDry(virtualNode.type_)) {
        return;
    }

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    if (true) {
        attachVirtualNode(nativeNode, virtualNode);
    }
};

const rehydrateView = (newVirtualNode, oldVirtualNode) => {
    newVirtualNode.ns_ = _determineNS(newVirtualNode);

    // Do nothing more with fragments
    if (_isDry(newVirtualNode.type_)) {
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (true) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === NODE_TEXT) {
        if (newVirtualNode.props_ !== oldVirtualNode.props_) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_
            );
        }
    } else {
        updateNativeElementAttributes(
            newVirtualNode.nativeNode_,
            newVirtualNode.props_,
            oldVirtualNode.props_
        );
    }
};

const _createNativeNode = (virtualNode) => {
    if (virtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(virtualNode.props_);
    }

    return createNativeElementWithNS(
        virtualNode.ns_,
        virtualNode.type_,
        virtualNode.props_
    );
};

const _determineNS = (virtualNode) => {
    // Intrinsic namespace
    if (virtualNode.type_ === 'svg') {
        return NS_SVG;
    }

    // As we never hydrate the container node,
    // the parent_ never empty here
    if (virtualNode.parent_.ns_ === NS_SVG && virtualNode.parent_.type_ === 'foreignObject') {
        return NS_HTML;
    }

    // By default, pass namespace below.
    return virtualNode.parent_.ns_;
};

const _isDry = (type) => {
    return type === NODE_FRAGMENT || isFunction(type);
};

// Important Note
// This module does not handle RootType nodes

const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const hostNode = _findHostNode(newVirtualNode);
        if (hostNode !== null) {
            hostNode.lastCommittedNativeChild_ = newVirtualNode.nativeNode_;
        }
    }
};

const insertView = (node) => {
    hydrateView(node);

    if (node.nativeNode_ !== null) {
        const hostNode = _findHostNode(node);
        if (hostNode !== null) {
            const nativeNodeAfter = (
                hostNode.lastCommittedNativeChild_ !== null
                    ? hostNode.lastCommittedNativeChild_.nextSibling
                    : hostNode.nativeNode_.firstChild
            );
            hostNode.nativeNode_.insertBefore(node.nativeNode_, nativeNodeAfter);
            hostNode.lastCommittedNativeChild_ = node.nativeNode_;
        }
    }
};

const deleteView = (subtree) => {
    _loopClosestNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
};

// Find the virtual node in the parent chain which its native node is not null
const _findHostNode = (node) => {
    let current = node.parent_;

    while (true) {
        if (current === null) {
            return null;
        }
        if (current.nativeNode_ !== null) {
            return current;
        }
        current = current.parent_;
    }
};

const _loopClosestNativeNodes = (node, callback) => {
    let root = node;
    let current = node;

    while (true) {
        if (current.nativeNode_ !== null) {
            callback(current.nativeNode_);
        } else if (current.child_ !== null) {
            current = current.child_;
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
        }
        current = current.sibling_;
        continue;
    }
};

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {number} tag
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, tag) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.tag_ = tag;
    this.destroy_ = null;
    this.lastDestroy_ = null;
    this.next_ = null;
}

const TAG_ALWAYS = 0;
const TAG_LAZY = 1;
const TAG_DEPS = 2;
const TAG_DEPS_CHANGED = 3;

const useEffect = (callback, deps = null) => {
    return resolveCurrentHook(
        (currentNode) => {
            const effectTag = _determineEffectTag(deps, null);
            return new EffectHook(callback, deps, effectTag);
        },
        (currentHook) => {
            if (true) {
                if (!(
                    deps === null && currentHook.deps_ === null ||
                    deps.length === currentHook.deps_.length
                )) {
                    throw new Error('Deps must be size-fixed');
                }
                // On the production, we accept the deps change its length
                // and consider it is changed
            }
    
            const effectTag = _determineEffectTag(deps, currentHook.deps_);

            if (effectTag === TAG_LAZY) {
                return;
            }
    
            if (effectTag === TAG_DEPS) {
                currentHook.tag_ = effectTag;
                return;
            }
    
            if (effectTag === TAG_ALWAYS || effectTag === TAG_DEPS_CHANGED) {
                currentHook.callback_ = callback;
                currentHook.deps_ = deps;
                currentHook.tag_ = effectTag;

                currentHook.lastDestroy_ = currentHook.destroy_;
                currentHook.destroy_ = null;
                return;
            }
        }
    );
};

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
const mountEffects = (functionalVirtualNode, isNewNodeMounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (isNewNodeMounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
                _mountEffectHook(hook);
            }
        }

        hook = hook.next_;
    }
};

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
const destroyEffects = (functionalVirtualNode, isNodeUnmounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isNodeUnmounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
                    _destroyEffectHook(hook, isNodeUnmounted);
                }
            }
        }

        hook = hook.next_;
    }
};

/**
 *
 * @param {EffectHook} effectHook
 */
const _mountEffectHook = (effectHook) => {
    effectHook.destroy_ = effectHook.callback_();

    if (effectHook.destroy_ === undefined) {
        effectHook.destroy_ = null;
    }
};

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
const _destroyEffectHook = (hook, isNodeUnmounted) => {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
};

const _determineEffectTag = (deps, lastDeps) => {
    // Always
    if (deps === null) {
        return TAG_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return TAG_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return TAG_DEPS;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return TAG_DEPS;
    }

    // DepsChanged
    {
        return TAG_DEPS_CHANGED;
    }
};

const queueMap = new Map();
let timeoutId = null;

const _flushQueues = () => {
    queueMap.forEach((queue, context) => {
        let value, hook, hasChanges = false;
        
        while (queue.length > 0) {
            [value, hook] = queue.pop();

            let newValue;
            
            if (isFunction(value)) {
                newValue = value(hook.value_);
            } else {
                newValue = value;
            }
            
            if (newValue !== hook.value_) {
                hook.value_ = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resolveTree(context);
        }
    });

    queueMap.clear();
    timeoutId = null;
};

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @constructor
 */
function StateHook(context, initialValue) {
    this.context_ = context;
    
    this.value_ = initialValue;

    this.setValue_ = (value) => {
        let queue = queueMap.get(this.context_);
        if (queue === undefined) {
            queue = [[value, this]];
            queueMap.set(this.context_, queue);
        } else {
            queue.push([value, this]);
        }

        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(_flushQueues);
    };

    this.next_ = null;
}

const useState = (initialValue) => {
    return resolveCurrentHook(
        (currentNode) => new StateHook(currentNode, initialValue),
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
};

const reconcileChildren = (current) => {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current);
    } else {
        _reconcileChildrenOfStaticNode(current);
    }
};

const _reconcileChildOfDynamicNode = (current) => {
    const oldChild = (
        current.alternative_ !== null
            ? current.alternative_.child_
            : current.child_
    );

    prepareCurrentlyProcessing(current);
    const newChild = createVirtualNodeFromContent(
        current.type_(current.props_)
    );
    flushCurrentlyProcessing();

    current.child_ = newChild;

    if (newChild !== null) {
        newChild.parent_ = current;
    }

    if (newChild === null && oldChild !== null) {
        _addDeletion(current, oldChild);
    }
    else if (newChild !== null && oldChild !== null) {
        // If the same
        if (newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }
};

const _reconcileChildrenOfStaticNode = (current) => {
    if (current.alternative_ === null) {
        return;
    }

    const oldChildren = _mapChildren(current.alternative_);
    const newChildren = _mapChildren(current);

    let newChild;
    oldChildren.forEach((oldChild, mapKey) => {
        newChild = newChildren.get(mapKey);
        if (newChild !== undefined && newChild.type_ === oldChild.type_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    });
};

const _makeAlternative = (newChild, oldChild) => {
    newChild.alternative_ = oldChild;

    if (isFunction(newChild.type_)) {
        newChild.hook_ = oldChild.hook_;

        let hook = newChild.hook_;
        while (hook !== null) {
            if (hook instanceof StateHook) {
                hook.context_ = newChild;
            }
            hook = hook.next_;
        }
    }
};

const _addDeletion = (current, deletedChild) => {
    if (current.deletions_ === null) {
        current.deletions_ = [deletedChild];
    } else {
        current.deletions_.push(deletedChild);
    }
};

const _mapChildren = (node) => {
    const map = new Map();
    let child = node.child_;
    while (child !== null) {
        if (child.key_ !== null) {
            map.set(child.key_, child);
        } else {
            map.set(child.slot_, child);
        }
        child = child.sibling_;
    }
    return map;
};

// Algorithm: https://github.com/facebook/react/issues/7942

const workLoop = (performUnit, onReturn, root, ...data) => {
    let current = root;
    while (true) {
        performUnit(current, root, ...data);
        if (current.child_ !== null) {
            current = current.child_;
            continue;
        }
        if (current === root) {
            return;
        }
        while (current.sibling_ === null) {
            if (current.parent_ === null || current.parent_ === root) {
                return;
            }
            current = current.parent_;
            if (onReturn !== null) {
                onReturn(current);
            }
        }
        current = current.sibling_;
    }
};

const queueWork = (work) => {
    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(work);
    } else {
        setTimeout(work);
    }
};

const resolveTree = (current) => {
    const mountNodesMap = new Map();
    const unmountNodesMap = new Map();
    
    workLoop(_performUnitOfWork, _onReturn, current, mountNodesMap, unmountNodesMap);

    queueWork(() => {
        unmountNodesMap.forEach((isUnmounted, node) => {
            destroyEffects(node, isUnmounted);
        });
        mountNodesMap.forEach((isNewlyMounted, node) => {
            mountEffects(node, isNewlyMounted);
        });
    });
};

const _performUnitOfWork = (current, root, mountNodesMap, unmountNodesMap) => {
    reconcileChildren(current);

    // RootType never changes its child
    // Do nothing anymore
    if (current.type_ === Root) {
        return;
    }

    if (current === root) {
        if (current.hook_ !== null) {
            unmountNodesMap.set(current, false);
            mountNodesMap.set(current, false);
        }
    } else {
        if (current.alternative_ !== null) {
            updateView(current, current.alternative_);
            if (current.hook_ !== null) {
                unmountNodesMap.set(current.alternative_, false);
                mountNodesMap.set(current, false);
            }
            current.alternative_ = null;
        } else {
            insertView(current);
            if (current.hook_ !== null) {
                mountNodesMap.set(current, true);
            }
        }
    }
    
    if (current.deletions_ !== null) {
        const deletions = current.deletions_;
        current.deletions_ = null;

        deletions.forEach(subtree => {
            deleteView(subtree);
        });

        queueWork(() => {
            deletions.forEach(subtree => {
                workLoop((deletion) => {
                    if (deletion.hook_ !== null) {
                        unmountNodesMap.set(deletion, true);
                    }
                }, null, subtree);
            });
        });
    }
};

// Callback called after walking through a node and all of its ascendants
const _onReturn = (current) => {
    // This is when we cleanup the remaining temp props
    if (current.lastCommittedNativeChild_ !== null) {
        current.lastCommittedNativeChild_ = null;
    }
};

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 const mount = (children, targetNativeNode) => {
    const rootVirtualNode = createPortal(children, targetNativeNode);

    resolveTree(rootVirtualNode);
};

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 * @returns {VirtualNode}
 */
const createPortal = (children, targetNativeNode) => {
    /**
     * @type {VirtualNode}
     */
    let rootVirtualNode;

    if (!(rootVirtualNode = extractVirtualNode(targetNativeNode))) {
        if (true) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        rootVirtualNode = new VirtualNode(Root);

        // Determine the namespace (we only support SVG and HTML namespaces)
        rootVirtualNode.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, targetNativeNode);
        attachVirtualNode(targetNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
};

exports.Fragment = Fragment;
exports.createPortal = createPortal;
exports.jsx = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useRef = useRef;
exports.useState = useState;
