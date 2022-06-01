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
 * @param {function|string} type
 * @param {{}?} props
 * @param {string?} key
 */
function VirtualNode(type, props = {}, key = null) {
    // Identification
    // ==============

    this.type_ = type;

    // Convert to string to avoid conflict with slot
    this.key_ = key !== null ? ('' + key) : key;

    this.slot_ = null;

    // Props and hooks
    // ===============

    if (!(props.ref === undefined || props.ref instanceof RefHook)) {
        // Delete the invalid ref
        delete props.ref;
        
        if (true) {
            console.error('The ref value must be created by the useRef hook');
        }
    }
    this.props_ = props;

    this.hook_ = null;
    
    // Output native node and relates
    // =======================
    
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
const NS_HTML = 0;
const NS_SVG = 1;

// Special node types
const TextNode = '#';
const Fragment = '[';
const Portal = (props) => props.children;

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode
 */
const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.props_.ref !== undefined) {
        virtualNode.props_.ref.current = nativeNode;
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
    const {key, ...props} = attributes || {};

    const virtualNode = new VirtualNode(type, props, key);

    if (isFunction(type)) {
        // JSX children
        if (content.length > 0) {
            virtualNode.props_.children = content.length > 1 ? content : content[0];
        }
    } else if (type === TextNode) {
        // Place TextNode after Function
        // because this type will be rarely used
        virtualNode.props_.children = content.map(t => '' + t).join('');
    } else {
        // Append children directly with static nodes
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
        
    if (isString(content)) {
        return new VirtualNode(TextNode, {children: content});
    }

    if (isNumber(content)) {
        return new VirtualNode(TextNode, {children: '' + content});
    }

    if (isArray(content)) {
        const fragment = new VirtualNode(Fragment);
        _appendChildrenFromContent(fragment, content);
        return fragment;
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
        let childNode, prevChildNode = null, i = 0;
        i < content.length; ++i
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

// Important!!!
// This module does not handle Portal nodes

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

    if (newVirtualNode.type_ === TextNode) {
        if (newVirtualNode.props_.children !== oldVirtualNode.props_.children) {
            updateNativeTextNode(
                newVirtualNode.nativeNode_,
                newVirtualNode.props_.children
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
    if (virtualNode.type_ === TextNode) {
        return createNativeTextNode(virtualNode.props_.children);
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
    return type === Fragment || isFunction(type);
};

// Important!!!
// This module does not handle Portal nodes

const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);

    if (newVirtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(newVirtualNode);
        if (host !== null) {
            host.lastManipulatedClientNativeNode_ = newVirtualNode.nativeNode_;
        }
    }
};

const insertView = (virtualNode) => {
    hydrateView(virtualNode);

    if (virtualNode.nativeNode_ !== null) {
        const host = _findHostVirtualNode(virtualNode);
        if (host !== null) {
            const nativeNodeAfter = (
                host.lastManipulatedClientNativeNode_ !== null
                    ? host.lastManipulatedClientNativeNode_.nextSibling
                    : host.nativeNode_.firstChild
            );
            host.nativeNode_.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            host.lastManipulatedClientNativeNode_ = virtualNode.nativeNode_;
        }
    }
};

const deleteView = (subtree) => {
    _loopClientNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
};

// Find the virtual node in the parent chain which its native node is not null
const _findHostVirtualNode = (virtualNode) => {
    let current = virtualNode.parent_;

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

const _loopClientNativeNodes = (virtualNode, callback) => {
    let root = virtualNode;
    let current = virtualNode;

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

const STATE_NORMAL = 0;
const STATE_ERROR = 1;

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @param {number} tag
 * @constructor
 */
function StateHook(context, initialValue, tag) {
    this.context_ = context;
    this.value_ = initialValue;
    this.setValue_ = _setState.bind(this);
    this.tag_ = tag;
    this.next_ = null;
}

const useState = (initialValue) => {
    return resolveCurrentHook(
        (currentNode) => new StateHook(currentNode, initialValue, STATE_NORMAL),
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
};

const useError = (initialError) => {
    return resolveCurrentHook(
        (currentNode) => {
            // Make sure we have only one error hook in a component
            // In the production, we allow the initialization but skip it then
            if (true) {
                let hook = currentNode.hook_;
                while (hook !== null) {
                    if (hook instanceof StateHook && hook.tag_ === STATE_ERROR) {
                        throw new Error('A component accepts only one useError hook');
                    }
                    hook = hook.next_;
                }
            }

            // Make sure the initial error is valid
            if (!_validateError(initialError)) {
                // If the initial error is invalid,
                // use null instead
                initialError = null;
            }
            
            return new StateHook(currentNode, initialError, STATE_ERROR);
        },
        (currentHook) => [currentHook.value_, currentHook.setValue_]
    );
};

const queueMap = new Map();
let timeoutId = null;

function _setState(value) {
    let queue = queueMap.get(this.context_);

    if (queue === undefined) {
        queue = [[value, this]];
        queueMap.set(this.context_, queue);
    } else {
        queue.unshift([value, this]);
    }

    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(_flushQueues);
}

const _flushQueues = () => {
    queueMap.forEach((queue, contextAsKey) => {
        // Important!!!
        // Use hook.context_ instead of contextAsKey
        // as it may be outdated due to the reconciliation process

        let value, hook, hasChanges = false;
        
        while (queue.length > 0) {
            [value, hook] = queue.pop();

            let newValue;
            
            if (isFunction(value)) {
                try {
                    newValue = value(hook.value_);
                } catch (error) {
                    catchError(error, hook.context_);
                    continue;
                }
            } else {
                newValue = value;
            }

            if (hook.tag_ === STATE_ERROR && !_validateError(newValue)) {
                // If the new error is invalid,
                // keep the current error unchanged
                continue;
            }
            
            if (newValue !== hook.value_) {
                hook.value_ = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            resolveTree(hook.context_);
        }
    });

    queueMap.clear();
    timeoutId = null;
};

const _validateError = (error) => {
    if (!(error === null || error instanceof Error)) {
        if (true) {
            console.error('Error hooks only accept the value is an instance of Error or null');
        }
        return false;
    }

    return true;
};

const catchError = (error, virtualNode) => {
    let parent = virtualNode.parent_;
    let hook;

    while (parent !== null) {
        hook = parent.hook_;
        while (hook !== null) {
            if (hook instanceof StateHook && hook.tag_ === STATE_ERROR) {
                hook.setValue_((prevError) => {
                    return prevError || error;
                });
                return;
            }
            hook = hook.next_;
        }
        parent = parent.parent_;
    }

    if (true) {
        setTimeout(() => {
            console.info('You can catch this error by implementing an error boundary with the useError hook');
        });
    }

    throw error;
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

const EFFECT_ALWAYS = 0;
const EFFECT_LAZY = 1;
const EFFECT_DEPS = 2;
const EFFECT_DEPS_CHANGED = 3;

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

            if (effectTag === EFFECT_LAZY) {
                return;
            }
    
            if (effectTag === EFFECT_DEPS) {
                currentHook.tag_ = effectTag;
                return;
            }
    
            if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
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
 * @param {boolean} isNewlyMounted
 */
const mountEffects = (functionalVirtualNode, isNewlyMounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (isNewlyMounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
                try {
                    _mountEffect(hook);
                } catch (error) {
                    catchError(error, functionalVirtualNode);
                }
            }
        }
        hook = hook.next_;
    }
};

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isUnmounted
 */
const destroyEffects = (functionalVirtualNode, isUnmounted) => {
    let hook = functionalVirtualNode.hook_;
    while (hook !== null) {
        if (hook instanceof EffectHook) {
            if (hook.lastDestroy_ !== null || hook.destroy_ !== null) {
                if (isUnmounted || hook.tag_ === EFFECT_ALWAYS || hook.tag_ === EFFECT_DEPS_CHANGED) {
                    try {
                        _destroyEffect(hook, isUnmounted);
                    } catch (error) {
                        catchError(error, functionalVirtualNode);
                    }
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
const _mountEffect = (effectHook) => {
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
const _destroyEffect = (hook, isNodeUnmounted) => {
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
        return EFFECT_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return EFFECT_LAZY;
    }

    // Deps
    // 1. When init effect
    if (lastDeps === null) {
        return EFFECT_DEPS;
    }
    // 2. Two arrays are equal
    if (compareArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
};

const reconcileChildren = (current, isSubtreeRoot) => {
    if (isFunction(current.type_)) {
        _reconcileChildOfDynamicNode(current, isSubtreeRoot);
    } else {
        _reconcileChildrenOfStaticNode(current);
    }
};

const _reconcileChildOfDynamicNode = (current, isSubtreeRoot) => {
    const oldChild = isSubtreeRoot ? current.child_ : (
        current.alternative_ !== null ? current.alternative_.child_ : null
    );

    let newContent;

    prepareCurrentlyProcessing(current);
    try {
        newContent = current.type_(current.props_);
    } catch (error) {
        catchError(error, current);
        newContent = null;
    }
    flushCurrentlyProcessing();

    const newChild = createVirtualNodeFromContent(newContent);

    if (newChild !== null) {
        newChild.parent_ = current;
        newChild.slot_ = 0;
    }

    if (oldChild !== null) {
        if (newChild !== null && newChild.type_ === oldChild.type_ && newChild.key_ === oldChild.key_) {
            _makeAlternative(newChild, oldChild);
        } else {
            _addDeletion(current, oldChild);
        }
    }

    current.child_ = newChild;
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

const _addDeletion = (current, childToDelete) => {
    if (current.deletions_ === null) {
        current.deletions_ = [childToDelete];
    } else {
        current.deletions_.push(childToDelete);
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
    const isSubtreeRoot = current === root;
    
    reconcileChildren(current, isSubtreeRoot);

    // Portal nodes never change their child
    // Do nothing anymore
    if (current.type_ === Portal) {
        return;
    }

    if (isSubtreeRoot) {
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

        for (let i = 0; i < deletions.length; ++i) {
            deleteView(deletions[i]);
        }

        queueWork(() => {
            for (let i = 0; i < deletions.length; ++i) {
                workLoop((vnode) => {
                    if (vnode.hook_ !== null) {
                        unmountNodesMap.set(vnode, true);
                    }
                }, null, deletions[i]);
            }
        });
    }
};

// Callback called after walking through a node and all of its ascendants
const _onReturn = (current) => {
    // This is when we cleanup the remaining temp props
    if (current.lastManipulatedClientNativeNode_ !== null) {
        current.lastManipulatedClientNativeNode_ = null;
    }
};

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 const mount = (children, targetNativeNode) => {
    const portal = createPortal(children, targetNativeNode);

    // Render view
    resolveTree(portal);
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
    let portal;

    if (!(portal = extractVirtualNode(targetNativeNode))) {
        if (true) {
            if (targetNativeNode.firstChild) {
                console.error('Target node must be empty');
            }
        }
        
        portal = new VirtualNode(Portal);

        // Determine the namespace (we only support SVG and HTML namespaces)
        portal.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(portal, targetNativeNode);
        attachVirtualNode(targetNativeNode, portal);
    }

    portal.props_.children = children;

    return portal;
};

exports.Fragment = Fragment;
exports.TextNode = TextNode;
exports.createElement = createElement;
exports.createPortal = createPortal;
exports.jsx = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useError = useError;
exports.useRef = useRef;
exports.useState = useState;
