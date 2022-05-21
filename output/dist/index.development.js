'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

const hasOwnProperty = (obj, propName) => {
    return Object.prototype.hasOwnProperty.call(obj, propName);
};

const isString = (value) => {
    return typeof value === 'string' || value instanceof String;
};

const isNumber = (value) => {
    return typeof value === 'number' || value instanceof Number;
};

const isFunction = (value) => {
    return value instanceof Function;
};

const isArray = (value) => {
    return value instanceof Array;
};

const isEmpty = (value) => {
    return value === undefined || value === null;
};

/**
 * 
 * @param {Array|string} full 
 * @param {Array|string} sub 
 * @returns {boolean}
 */
const startsWith = (full, sub) => {
    if (full.length < sub.length) {
        return false;
    }

    for (let i = sub.length - 1; i >= 0; --i) {
        if (sub[i] !== full[i]) {
            return false;
        }
    }

    return true;
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

/**
 *
 * @param {string|function} type
 * @constructor
 */
function VirtualNode(type) {
    this.type_ = type;
    this.props_ = {};
    this.key_ = null;
    this.ref_ = null;

    this.hooks_ = [];

    /**
     * @type {VirtualNode|null}
     */
    this.parent_ = null;

    /**
     * @type {VirtualNode[]}
     */
    this.children_ = [];

    this.path_ = '';

    this.nativeNode_ = null;
    this.ns_ = null;

    this.tag_ = (type === NODE_FRAGMENT || type === NODE_ARRAY) ? TAG_COLLECTIVE : (
        isFunction(type) ? TAG_FUNCTIONAL : TAG_VIEWABLE
    );
}

// Do not support namespace MathML as almost browsers do not support as well
const NS_HTML = 0;
const NS_SVG = 1;

// Note:
// Use special URI characters

const NODE_TEXT = '#';
const NODE_ARRAY = '[';
const NODE_FRAGMENT = '=';

const TAG_VIEWABLE = 0;
const TAG_FUNCTIONAL = 1;
const TAG_COLLECTIVE = 2;

const PATH_SEP = '/';

const RootType = (props) => {
    return props.children;
};

/**
 * 
 * @param {*} key 
 * @returns {string}
 */
const escapeVirtualNodeKey = (key) => {
    return '@' + encodeURIComponent(key);
};

let functionalTypeInc = 0;
let rootIdInc = 0;

/**
 * 
 * @param {Function} type 
 * @returns {string}
 */
const createFunctionalTypeAlias = (type) => {
    return (
        (true ? type.name : '') +
        '{' + (++functionalTypeInc).toString(36)
    );
};

/**
 * 
 * @returns {string}
 */
const createRootId = () => {
    return '~' + (++rootIdInc).toString(36);
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
 * @param {*} content
 * @return {null|VirtualNode}
 */
const createVirtualNodeFromContent = (content) => {
    let node = null;

    if (content instanceof VirtualNode) {
        node = content;
    }
    else if (isString(content) || isNumber(content)) {
        node = new VirtualNode(NODE_TEXT);
        node.props_.children = content;
    }
    else if (isArray(content)) {
        node = new VirtualNode(NODE_ARRAY);
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
        let childNode, i = 0, len = content.length
        ; i < len
        ; ++i
    ) {
        childNode = createVirtualNodeFromContent(content[i]);
        if (childNode !== null) {
            parentNode.children_.push(childNode);
            childNode.parent_ = parentNode;
        }
    }
};

/**
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
const createElement = (type, attributes, ...content) => {
    const {key = null, ref = null, ...props} = attributes || {};

    const virtualNode = new VirtualNode(type);
    
    virtualNode.props_ = props;
    virtualNode.key_ = key;
    virtualNode.ref_ = ref;

    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        // JSX children
        virtualNode.props_.children = content.length > 1 ? content : content[0];
    } else {
        // Append children directly
        appendChildrenFromContent(virtualNode, content);
    }

    return virtualNode;
};

const PROP_TYPE_ALIAS = 'hook_alias';
const PROP_VIRTUAL_NODE = 'hook_vnode';
const PROP_ROOT_ID = 'hook_rootid';

/**
 *
 * @param {Function} type
 * @returns {string}
 */
const getFunctionalTypeAlias = (type) => {
    if (hasOwnProperty(type, PROP_TYPE_ALIAS)) {
        return type[PROP_TYPE_ALIAS];
    }

    return (
        type[PROP_TYPE_ALIAS] = createFunctionalTypeAlias(type)
    );
};

/**
 * 
 * @param {Element} root 
 * @returns {string}
 */
const getRootId = (root) => {
    if (hasOwnProperty(root, PROP_ROOT_ID)) {
        return root[PROP_ROOT_ID];
    }

    return (
        root[PROP_ROOT_ID] = createRootId()
    );
};

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

/**
 *
 * @type {Map<string, Array>}
 */
const memoizedHooksMap = new Map();

/**
 * 
 * @param {string} path 
 * @returns {Array|null}
 */
const findMemoizedHooks = (path) => {
    return memoizedHooksMap.get(path) || null;
};

/**
 * 
 * @param {string} path 
 * @param {Array} hooks 
 */
const linkMemoizedHooks = (path, hooks) => {
    memoizedHooksMap.set(path, hooks);
};

/**
 * 
 * @param {string} path 
 */
const unlinkMemoizedHooks = (path) => {
    memoizedHooksMap.delete(path);
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
    return hasOwnProperty(target, prop) && !isEmpty(target[prop]);
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

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

const hydrateViewableVirtualNode = (viewableVirtualNode) => {
    // Create the native node
    const nativeNode = _createNativeNode(viewableVirtualNode);

    linkNativeNode(viewableVirtualNode, nativeNode);
    
    if (true) {
        if (nativeNode !== null) {
            attachVirtualNode(nativeNode, viewableVirtualNode);
        }
    }
};

const _createNativeNode = (viewableVirtualNode) => {
    if (viewableVirtualNode.type_ === NODE_TEXT) {
        return createNativeTextNode(viewableVirtualNode.props_.children);
    }

    return createNativeElementWithNS(
        viewableVirtualNode.ns_,
        viewableVirtualNode.type_,
        viewableVirtualNode.props_
    );
};

// !!!IMPORTANT
// Only use this module for viewable nodes
// Passing Functional, Array, Fragment nodes will lead to crash

const commitView = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    if (oldViewableVirtualNodeMap.size === 0) {
        _append(newViewableVirtualNodeMap);
    } else {
        /*
        | for key in oldMap
        |     if newMap.has(key)
        |         updateNativeNodes
        |     else
        |         removeNativeNodes
        |
        | for key in newMap
        |     if !oldMap.has(key)
        |         insertNativeNodes
        */
        _removeAndUpdate(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
        _insert(oldViewableVirtualNodeMap, newViewableVirtualNodeMap);
    }
};

const _removeAndUpdate = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    // New node to be inserted
    let newViewableVirtualNode;

    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';

    oldViewableVirtualNodeMap.forEach((oldViewableVirtualNode, key) => {
        if (newViewableVirtualNodeMap.has(key)) {
            newViewableVirtualNode = newViewableVirtualNodeMap.get(key);

            // Reuse the existing native node
            linkNativeNode(newViewableVirtualNode, oldViewableVirtualNode.nativeNode_);

            if (true) {
                attachVirtualNode(oldViewableVirtualNode.nativeNode_, newViewableVirtualNode);
            }

            if (newViewableVirtualNode.type_ === NODE_TEXT) {
                if (newViewableVirtualNode.props_.children !== oldViewableVirtualNode.props_.children) {
                    updateNativeTextNode(
                        newViewableVirtualNode.nativeNode_,
                        newViewableVirtualNode.props_.children
                    );
                }
            } else {
                updateNativeElementAttributes(
                    newViewableVirtualNode.nativeNode_,
                    newViewableVirtualNode.props_,
                    oldViewableVirtualNode.props_
                );
            }
        } else {
            if (!startsWith(key, lastRemovedKey + PATH_SEP)) {
                _removeNativeNodesOfVirtualNode(oldViewableVirtualNode);
                lastRemovedKey = key;
            }
        }
    });
};

const _append = (newViewableVirtualNodeMap) => {
    let nativeHost;

    newViewableVirtualNodeMap.forEach((virtualNode) => {
        nativeHost = _findNativeHost(virtualNode);

        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);
            nativeHost.appendChild(virtualNode.nativeNode_);
        }
    });
};

const _insert = (oldViewableVirtualNodeMap, newViewableVirtualNodeMap) => {
    let pendingViewableVirtualNodes = [];

    newViewableVirtualNodeMap.forEach((newViewableVirtualNode, key) => {
        if (!oldViewableVirtualNodeMap.has(key)) {
            pendingViewableVirtualNodes.push(newViewableVirtualNode);
        } else {
            _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, oldViewableVirtualNodeMap.get(key));
            pendingViewableVirtualNodes.length = 0;
        }
    });

    if (pendingViewableVirtualNodes.length > 0) {
        _insertClosestNativeNodesOfVirtualNodes(pendingViewableVirtualNodes, null);
    }
};

const _insertClosestNativeNodesOfVirtualNodes = (virtualNodes, virtualNodeAfter) => {
    const nativeNodeAfter = virtualNodeAfter && _findFirstNativeNode(virtualNodeAfter) || null;
    
    for (
        let virtualNode, nativeHost, i = 0, len = virtualNodes.length
        ; i < len
        ; ++i
    ) {
        virtualNode = virtualNodes[i];

        nativeHost = _findNativeHost(virtualNode);
        
        if (nativeHost !== null) {
            hydrateViewableVirtualNode(virtualNode);

            if (nativeNodeAfter !== null && nativeHost === nativeNodeAfter.parentNode) {
                nativeHost.insertBefore(virtualNode.nativeNode_, nativeNodeAfter);
            } else {
                nativeHost.appendChild(virtualNode.nativeNode_);
            }
        }
    }
};

const _removeNativeNodesOfVirtualNode = (virtualNode) => {
    const nativeNodes = _findClosestNativeNodes(virtualNode);

    for (
        let nativeNode, i = 0, len = nativeNodes.length
        ; i < len
        ; ++i
    ) {
        nativeNode = nativeNodes[i];

        if (nativeNode.parentNode !== null) {
            nativeNode.parentNode.removeChild(nativeNode);
        }
    }
};

const _findNativeHost = (virtualNode) => {
    if (virtualNode.type_ === RootType) {
        return virtualNode.nativeNode_;
    }
    
    if (virtualNode.parent_ === null) {
        return null;
    }

    if (virtualNode.parent_.nativeNode_ === null) {
        return _findNativeHost(virtualNode.parent_);
    }

    return virtualNode.parent_.nativeNode_;
};

const _findFirstNativeNode = (virtualNode) => {
    if (virtualNode.nativeNode_ !== null) {
        return virtualNode.nativeNode_;
    }
    
    let firstNativeNode = null;
    
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len && firstNativeNode === null
        ; ++i
    ) {
        firstNativeNode = _findFirstNativeNode(virtualNode.children_[i]);
    }

    return firstNativeNode;
};

const _findClosestNativeNodes = (virtualNode) => {
    if (virtualNode.nativeNode_ !== null) {
        return [virtualNode.nativeNode_];
    }
    
    const closestNativeNodes = [];

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        closestNativeNodes.push(..._findClosestNativeNodes(virtualNode.children_[i]));
    }

    return closestNativeNodes;
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

        if (!(
            deps === null && currentHook.deps_ === null ||
            deps.length === currentHook.deps_.length
        )) {
            throw new Error('Deps must be size-fixed');
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
    hook.tag_ = _getEffectTag(deps);

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
const _destroyEffectHook = (hook, isNodeUnmounted = false) => {
    if (hook.lastDestroy_ !== null && !isNodeUnmounted) {
        hook.lastDestroy_();
        return;
    }

    if (hook.destroy_ !== null) {
        hook.destroy_();
    }
};

const _getEffectTag = (deps, lastDeps = false) => {
    // Always
    if (deps === null) {
        return TAG_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return TAG_LAZY;
    }

    // Deps
    if (lastDeps === false || compareSameLengthArrays(deps, lastDeps)) {
        return TAG_DEPS;
    }

    // DepsChanged
    {
        return TAG_DEPS_CHANGED;
    }
};

/**
 *
 * @param {VirtualNode} rootVirtualNode
 */
const updateVirtualTree = (rootVirtualNode) => {
    // Update virtual tree and create node maps
    const oldTypedVirtualNodeMaps = _getVirtualNodeMaps(rootVirtualNode);
    const newTypedVirtualNodeMaps = _updateVirtualTreeImpl(rootVirtualNode);

    // Resolve effects and commit view
    _resolveUnmountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
    commitView(oldTypedVirtualNodeMaps.viewable_, newTypedVirtualNodeMaps.viewable_);
    _resolveMountedVirtualNodes(oldTypedVirtualNodeMaps.functional_, newTypedVirtualNodeMaps.functional_);
};

const _updateVirtualTreeImpl = (rootVirtualNode) => {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _updateVirtualNodeRecursive(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
};

const _updateVirtualNodeRecursive = (virtualNode, typedVirtualNodeMaps) => {
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    
        prepareCurrentlyProcessing(virtualNode);
        const newVirtualNode = createVirtualNodeFromContent(
            virtualNode.type_(virtualNode.props_)
        );
        flushCurrentlyProcessing();
    
        if (newVirtualNode !== null) {
            virtualNode.children_[0] = newVirtualNode;
            newVirtualNode.parent_ = virtualNode;
    
            // This step aimed to read memoized hooks and restore them
            // Memoized data affects the underneath tree,
            // so don't wait until the recursion finished to do this
            resolveVirtualTree(virtualNode);
        }
    } else if (virtualNode.tag_ === TAG_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _updateVirtualNodeRecursive(virtualNode.children_[i], typedVirtualNodeMaps);
    }
};

const _createEmptyTypedVirtualNodeMaps = () => {
    return {
        functional_: new Map(),
        viewable_: new Map(),
    };
};

const _getVirtualNodeMaps = (rootVirtualNode) => {
    const typedVirtualNodeMaps = _createEmptyTypedVirtualNodeMaps();
    _walkVirtualNode(rootVirtualNode, typedVirtualNodeMaps);
    return typedVirtualNodeMaps;
};

const _walkVirtualNode = (virtualNode, typedVirtualNodeMaps) => {
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        typedVirtualNodeMaps.functional_.set(virtualNode.path_, virtualNode);
    } else if (virtualNode.tag_ === TAG_VIEWABLE) {
        typedVirtualNodeMaps.viewable_.set(virtualNode.path_, virtualNode);
    }

    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _walkVirtualNode(virtualNode.children_[i], typedVirtualNodeMaps);
    }
};

const _resolveUnmountedVirtualNodes = (oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) => {
    oldFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const unmounted = !newFunctionalVirtualNodeMap.has(key);

        destroyEffectsOnFunctionalVirtualNode(virtualNode, unmounted);

        if (unmounted) {
            unlinkMemoizedHooks(virtualNode.path_);
        }
    });
};

const _resolveMountedVirtualNodes = (oldFunctionalVirtualNodeMap, newFunctionalVirtualNodeMap) => {
    newFunctionalVirtualNodeMap.forEach((virtualNode, key) => {
        const mounted = !oldFunctionalVirtualNodeMap.has(key);

        mountEffectsOnFunctionalVirtualNode(virtualNode, mounted);
    });
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
            updateVirtualTree(this.context_);
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

const resolveVirtualTree = (rootVirtualNode) => {
    for (
        let i = 0, len = rootVirtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(rootVirtualNode.children_[i], rootVirtualNode.path_, i);
    }
};

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
const _resolveVirtualNodeRecursive = (virtualNode, parentPath, posInRow) => {
    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (virtualNode.key_ !== null
            ? escapeVirtualNodeKey(virtualNode.key_)
            : posInRow)
        + PATH_SEP
        + (virtualNode.tag_ === TAG_FUNCTIONAL
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

    // Restore memoized states
    if (virtualNode.tag_ === TAG_FUNCTIONAL) {
        const memoizedHooks = findMemoizedHooks(virtualNode.path_);
        if (memoizedHooks !== null) {
            // Here, new node does not have any hooks
            // because it is in the pending state
            // After when the tree is established
            // and then updating, the hooks will be called (or created if it is the first time)
            virtualNode.hooks_ = memoizedHooks;

            for (
                let hook, i = 0, len = virtualNode.hooks_.length
                ; i < len
                ; ++i
            ) {
                hook = virtualNode.hooks_[i];

                if (hook instanceof StateHook) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }

    // Namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    // Recursion
    for (
        let i = 0, len = virtualNode.children_.length
        ; i < len
        ; ++i
    ) {
        _resolveVirtualNodeRecursive(virtualNode.children_[i], virtualNode.path_, i);
    }
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

/**
 * 
 * @param {*} children 
 * @param {Element} targetNativeNode
 */
 const mount = (children, targetNativeNode) => {
    const rootVirtualNode = createPortal(children, targetNativeNode);

    // Set an unique path to split tree states between roots
    rootVirtualNode.path_ = getRootId(targetNativeNode);
    
    resolveVirtualTree(rootVirtualNode);

    updateVirtualTree(rootVirtualNode);
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
