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
const compareSameLengthArrays = (a, b) => {
    for (let i = a.length - 1; i >= 0; --i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

let currentlyProcessingFunctionalVirtualNode = null;
let currentlyProcessingHookIndex = -1;

const prepareCurrentlyProcessing = (functionalVirtualNode) => {
    currentlyProcessingFunctionalVirtualNode = functionalVirtualNode;
    currentlyProcessingHookIndex = -1;
};

const flushCurrentlyProcessing = () => {
    currentlyProcessingFunctionalVirtualNode = null;
    currentlyProcessingHookIndex = -1;
};

const resolveCurrentlyProcessing = () => {
    if (currentlyProcessingFunctionalVirtualNode === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }
    
    return [currentlyProcessingFunctionalVirtualNode, ++currentlyProcessingHookIndex];
};

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.current = current;
}

const useRef = (initialValue) => {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        return functionalVirtualNode.hooks_[hookIndex];
    }

    const hook = new RefHook(initialValue);

    functionalVirtualNode.hooks_.push(hook);

    return hook;
};

/**
 * 
 * @param {function|string} type 
 * @param {{}?} props 
 * @param {string|number?} key 
 * @param {RefHook?} ref 
 */
function VirtualNode(type, props = {}, key = null, ref = null) {
    this.type_ = type;

    this.key_ = key;
    
    this.slot_ = null;
    
    this.ns_ = null;

    this.parent_ = null;
    
    this.child_ = null;

    this.sibling_ = null;

    this.prevSibling_ = null;

    this.alternative_ = null;

    this.deletions_ = null;

    this.nativeNode_ = null;
    
    if (ref instanceof RefHook) {
        this.ref_ = ref;
    } else {
        this.ref_ = null;
    }

    if (type !== NODE_FRAGMENT) {
        this.props_ = props;

        if (isFunction(type)) {
            this.hooks_ = [];
        }
    }
}

// Do not support namespace MathML as almost browsers do not support as well
const NS_HTML = 0;
const NS_SVG = 1;

// Note:
// Use special URI characters

const NODE_TEXT = '#';
const NODE_FRAGMENT = '[';

const RootType = (props) => {
    return props.children;
};

/**
 * 
 * @param {VirtualNode} virtualNode 
 * @param {Node} nativeNode 
 */
const linkNativeNode = (virtualNode, nativeNode) => {
    virtualNode.nativeNode_ = nativeNode;

    if (virtualNode.ref_ !== null) {
        virtualNode.ref_.current = nativeNode;
    }
};

/**
 *
 * @param {*} content
 * @return {null|VirtualNode}
 */
const createVirtualNodeFromContent = (content) => {
    let node = null;

    if (content instanceof VirtualNode) {
        node = content;
    }
    else if (isString(content) || isNumber(content)) {
        node = new VirtualNode(NODE_TEXT, {children: content});
    }
    else if (isArray(content)) {
        node = new VirtualNode(NODE_FRAGMENT);
        appendChildrenFromContent(node, content);
    }

    return node;
};

/**
 * 
 * @param {VirtualNode} parentNode 
 * @param {Array} content
 */
const appendChildrenFromContent = (parentNode, content) => {
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

            childNode.prevSibling_ = prevChildNode;

            prevChildNode = childNode;
        }
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

    const virtualNode = new VirtualNode(type, props, key, ref);

    if (isFunction(type)) {
        // JSX children
        if (content.length > 0) {
            virtualNode.props_.children = content.length > 1 ? content : content[0];
        }
    } else {
        // Append children directly
        appendChildrenFromContent(virtualNode, content);
    }

    return virtualNode;
};

const PROP_VIRTUAL_NODE = 'hook_vnode';

/**
 * 
 * @param {Node} nativeNode 
 * @param {VirtualNode} virtualNode 
 */
const attachVirtualNode = (nativeNode, virtualNode) => {
    nativeNode[PROP_VIRTUAL_NODE] = virtualNode;
};

/**
 * 
 * @param {Node} nativeNode 
 * @returns {VirtualNode|undefined}
 */
const extractVirtualNode = (nativeNode) => {
    return nativeNode[PROP_VIRTUAL_NODE];
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

const hydrateView = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        // Root nodes always have apredefined native nodes and namespaces
        return;
    }

    virtualNode.ns_ = _determineNS(virtualNode);

    if (virtualNode.type_ === NODE_FRAGMENT || isFunction(virtualNode.type_)) {
        // Do nothing with fragments
        return;
    }

    const nativeNode = _createNativeNode(virtualNode);

    linkNativeNode(virtualNode, nativeNode);
    if (true) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, virtualNode);
        }
    }
};

const rehydrateView = (newVirtualNode, oldVirtualNode) => {
    if (newVirtualNode.type_ === RootType) {
        // Root nodes always have apredefined native nodes and namespaces
        return;
    }

    newVirtualNode.ns_ = _determineNS(newVirtualNode);

    if (newVirtualNode.type_ === NODE_FRAGMENT || isFunction(newVirtualNode.type_)) {
        // Do nothing with fragments
        return;
    }

    // Reuse the existing native node
    linkNativeNode(newVirtualNode, oldVirtualNode.nativeNode_);
    if (true) {
        attachVirtualNode(oldVirtualNode.nativeNode_, newVirtualNode);
    }

    if (newVirtualNode.type_ === NODE_TEXT) {
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

const _createNativeNode = (node) => {
    if (node.type_ === NODE_TEXT) {
        return createNativeTextNode(node.props_.children);
    }

    return createNativeElementWithNS(
        node.ns_,
        node.type_,
        node.props_
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

const updateView = (newVirtualNode, oldVirtualNode) => {
    rehydrateView(newVirtualNode, oldVirtualNode);
};

const insertView = (node) => {
    hydrateView(node);

    const nativeHost = _findNativeHost(node);

    if (nativeHost !== null) {
        if (node.nativeNode_)
        nativeHost.appendChild(node.nativeNode_);
    }
};

const deleteView = (subtree) => {
    _loopClosestNativeNodes(subtree, (nativeNode) => {
        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    });
};

const _findNativeHost = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ !== null) {
        return virtualNode.parent_.nativeNode_;
    }
    
    return _findNativeHost(virtualNode.parent_);
};

const _loopClosestNativeNodes = (virtualNode, callback) => {
    if (virtualNode.nativeNode_ !== null) {
        callback(virtualNode.nativeNode_);
        return;
    }
    
    let childNode = virtualNode.child_;
    while (childNode !== null) {
        _loopClosestNativeNodes(childNode, callback);
        childNode = childNode.sibling_;
    }
};

/**
 *
 * @param {function} callback
 * @param {[]|null} deps
 * @param {function} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, lastDestroy) {
    this.callback_ = callback;
    this.deps_ = deps;
    this.destroy_ = null;
    this.lastDestroy_ = lastDestroy;
    this.tag_ = null;
}

const TAG_ALWAYS = 0;
const TAG_LAZY = 1;
const TAG_DEPS = 2;
const TAG_DEPS_CHANGED = 3;

const useEffect = (callback, deps = null) => {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = functionalVirtualNode.hooks_[hookIndex];

        if (true) {
            if (!(
                deps === null && currentHook.deps_ === null ||
                deps.length === currentHook.deps_.length
            )) {
                throw new Error('Deps must be size-fixed');
            }
        }

        const effectTag = _getEffectTag(deps, currentHook.deps_);

        if (effectTag === TAG_LAZY) {
            return;
        }

        if (effectTag === TAG_DEPS) {
            currentHook.tag_ = effectTag;
            return;
        }

        if (effectTag === TAG_ALWAYS || effectTag === TAG_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy_);
            newHook.tag_ = effectTag;
            functionalVirtualNode.hooks_[hookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps, null);
    hook.tag_ = _getEffectTag(deps, null);

    functionalVirtualNode.hooks_.push(hook);
};

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNewNodeMounted
 */
const mountEffectsOnFunctionalVirtualNode = (functionalVirtualNode, isNewNodeMounted) => {
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

        if (!(hook instanceof EffectHook)) {
            continue;
        }

        if (isNewNodeMounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
            _mountEffectHook(hook);
        }
    }
};

/**
 *
 * @param {VirtualNode} functionalVirtualNode
 * @param {boolean} isNodeUnmounted
 */
const destroyEffectsOnFunctionalVirtualNode = (functionalVirtualNode, isNodeUnmounted) => {
    for (
        let hook, i = 0, len = functionalVirtualNode.hooks_.length
        ; i < len
        ; ++i
    ) {
        hook = functionalVirtualNode.hooks_[i];

        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy_ !== null || hook.destroy_ !== null)
        )) {
            continue;
        }

        if (isNodeUnmounted || hook.tag_ === TAG_ALWAYS || hook.tag_ === TAG_DEPS_CHANGED) {
            _destroyEffectHook(hook, isNodeUnmounted);
        }
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

const _getEffectTag = (deps, lastDeps) => {
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
    if (compareSameLengthArrays(deps, lastDeps)) {
        return TAG_DEPS;
    }

    // DepsChanged
    {
        return TAG_DEPS_CHANGED;
    }
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
        let newValue;
        
        if (isFunction(value)) {
            newValue = value(this.value_);
        } else {
            newValue = value;
        }
        
        if (newValue !== this.value_) {
            this.value_ = newValue;
            updateTree(this.context_);
        }
    };
}

const useState = (initialValue) => {
    const [functionalVirtualNode, hookIndex] = resolveCurrentlyProcessing();

    /**
     * @type {StateHook}
     */
    let hook;

    if (functionalVirtualNode.hooks_.length > hookIndex) {
        hook = functionalVirtualNode.hooks_[hookIndex];
    } else {
        hook = new StateHook(functionalVirtualNode, initialValue);
        functionalVirtualNode.hooks_.push(hook);
    }

    return [hook.value_, hook.setValue_];
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
        newChild.hooks_ = oldChild.hooks_;

        for (
            let hook, i = 0, len = newChild.hooks_.length
            ; i < len
            ; ++i
        ) {
            hook = newChild.hooks_[i];

            if (hook instanceof StateHook) {
                hook.context_ = newChild;
            }
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

const updateTree = (current) => {
    const mountNodesMap = new Map();
    _workLoop(_performUnitOfWork, _mountEffects, mountNodesMap, current, current);
};

const _performUnitOfWork = (current, root, mountNodesMap) => {
    reconcileChildren(current);

    if (current === root) {
        destroyEffectsOnFunctionalVirtualNode(current, false);
        mountNodesMap.set(current, false);

    } else if (current.alternative_ !== null) {
        updateView(current, current.alternative_);
        if (isFunction(current.type_)) {
            destroyEffectsOnFunctionalVirtualNode(current.alternative_, false);
            mountNodesMap.set(current, false);
        }
        current.alternative_ = null;
        
    } else {
        insertView(current);
        if (isFunction(current.type_)) {
            mountNodesMap.set(current, true);
        }
    }
    
    if (current.deletions_ !== null) {
        current.deletions_.forEach(subtree => {
            _workLoop((deletedNode) => {
                if (isFunction(deletedNode.type_)) {
                    destroyEffectsOnFunctionalVirtualNode(deletedNode, true);
                }
            }, null, null, subtree, subtree);

            deleteView(subtree);
        });
        current.deletions_ = null;
    }
};

const _mountEffects = (mountNodesMap) => {
    mountNodesMap.forEach((isNewlyMounted, node) => {
        mountEffectsOnFunctionalVirtualNode(node, isNewlyMounted);
    });
};

const _workLoop = (performUnit, onFinish, data, root, current, isUncleOfLastPerformedUnit = false) => {
    if (!isUncleOfLastPerformedUnit) {
        performUnit(current, root, data);

        if (current.child_ !== null) {
            _workLoop(performUnit, onFinish, data, root, current.child_);
            return;
        }
        
        if (current.sibling_ !== null) {
            _workLoop(performUnit, onFinish, data, root, current.sibling_);
            return;
        }
    } else {
        if (current.sibling_ !== null) {
            _workLoop(performUnit, onFinish, data, root, current.sibling_);
            return;
        }
    }

    // Stop if the current is the root
    // in case, the root has no children
    if (current !== root) {
        // Stop if the parent is the root
        if (current.parent_ !== root) {
            _workLoop(performUnit, onFinish, data, root, current.parent_, true);
            return;
        }
    }

    // The end of the work loop
    if (onFinish !== null) {
        onFinish(data);
    }
};

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 const mount = (children, targetNativeNode) => {
    const rootVirtualNode = createPortal(children, targetNativeNode);

    updateTree(rootVirtualNode);
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
        
        rootVirtualNode = new VirtualNode(RootType);

        // Determine the namespace (we only support SVG and HTML namespaces)
        rootVirtualNode.ns_ = ('ownerSVGElement' in targetNativeNode) ? NS_SVG : NS_HTML;
        
        linkNativeNode(rootVirtualNode, targetNativeNode);
        attachVirtualNode(targetNativeNode, rootVirtualNode);
    }

    rootVirtualNode.props_.children = children;

    return rootVirtualNode;
};

exports.createPortal = createPortal;
exports.h = createElement;
exports.mount = mount;
exports.useEffect = useEffect;
exports.useRef = useRef;
exports.useState = useState;
