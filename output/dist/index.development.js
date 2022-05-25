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
    
    this.path_ = '';
    
    this.ns_ = null;

    this.parent_ = null;
    
    this.child_ = null;

    this.sibling_ = null;
    
    if (type !== NODE_FRAGMENT) {
        this.props_ = props;

        this.ref_ = ref;
    
        this.nativeNode_ = null;

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

const PATH_SEP = '/';

const RootType = (props) => {
    return props.children;
};

/**
 * 
 * @param {string|number} key 
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
            childNode.posInRow_ = i;

            if (prevChildNode !== null) {
                prevChildNode.sibling_ = childNode;
            } else {
                parentNode.child_ = childNode;
            }

            prevChildNode = childNode;
        }
    }
};

// {root} -> (old) -> ... -> {old} -> (old) -> ...
// {root} -> (new) -> ... -> {new}
// {root} -> (new) -> ... -> {new} -> (new) -> ...
// 

// {root} -> (old) -> div -> p -> ... -> {old} -> (old) -> ...
//
// {root} -> (new) -> div -> span -> ... -> {new}
// U         U        U      C              C
//                        ~> p -> ... -> {old} -> (old) -> ...
//                           D           D        D
//
// {root} -> (new) -> div -> p -> ... -> {new}
// U         U        U      U           U (reuse old state)
//
// {root} -> (new) -> div -> p -> ... -> div -> {new}
// U         U        U      U           U      
//        ~> (old) ~> div ~> p ~> ... ~> div ~> {old} ~> (old) ~> ...
//           U        U      D           D      D
//                                       |
//                                       same parent -> {old} === {new} ? YES -> reuse old state
//                                                                        NO  -> new node
//

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
 * @param {VirtualNode} rootVirtualNode
 */
const updateVirtualTree = (rootVirtualNode) => {
    _walk(rootVirtualNode);
};

const _walk = (currentNode, oldNode, parentNode) => {
    if (parentNode.flag_ === 'UPDATE') {
        if (isFunction(currentNode.type_)) {
            // Find corresponding old node
            let oldNode = parentNode.old_.child_;
            while (oldNode !== null) {
                if (currentNode.key_ !== null && currentNode.key_ === oldNode.key_) {
                    break;
                }
                if (currentNode.posInRow_ === oldNode.posInRow_) {
                    break;
                }
                oldNode = oldNode.sibling_;
            }

            // Transfer memoized hooks
            if (oldNode !== null) {
                currentNode.hooks_ = oldNode.hooks_;
                for (
                    let hook, i = 0, len = currentNode.hooks_.length
                    ; i < len
                    ; ++i
                ) {
                    hook = currentNode.hooks_[i];
    
                    if (hook instanceof StateHook) {
                        hook.context_ = currentNode;
                    }
                }
            }

            // Render
            prepareCurrentlyProcessing(currentNode);
            const newChildNode = currentNode.type_(currentNode.props_);
            flushCurrentlyProcessing();
    
            if (newChildNode !== null) {
                newChildNode.parent_ = currentNode;
                newChildNode.old_ = currentNode.child_;
                newChildNode.flag_ = 'UPDATE';
                newChildNode.posInRow_ = 0;
                currentNode.child_ = newChildNode;
            } else {
                if (currentNode.child_ !== null) {
                    currentNode.child_.flag_ = 'DELETE';
                }
            }
        }
    }
};

/**
 *
 * @param {VirtualNode} context
 * @param {*} initialValue
 * @constructor
 */
function StateHook$1(context, initialValue) {
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
        hook = new StateHook$1(functionalVirtualNode, initialValue);
        functionalVirtualNode.hooks_.push(hook);
    }

    return [hook.value_, hook.setValue_];
};

const resolveVirtualTree = (virtualNode) => {
    let index = 0;
    let childNode = virtualNode.child_;
    
    while (childNode !== null) {
        _resolveVirtualNodeRecursive(childNode, virtualNode.path_, index);
        index++;
        childNode = childNode.sibling_;
    }
};

/**
 *
 * @param {VirtualNode} virtualNode
 * @param {string} parentPath
 * @private
 */
const _resolveVirtualNodeRecursive = (virtualNode, parentPath, posInRow) => {
    const functional = isFunction(virtualNode.type_);

    // Set path
    virtualNode.path_ = (
        parentPath
        + PATH_SEP
        + (!isNullish(virtualNode.key_)
            ? escapeVirtualNodeKey(virtualNode.key_)
            : posInRow)
        + PATH_SEP
        + (functional
            ? getFunctionalTypeAlias(virtualNode.type_)
            : virtualNode.type_)
    );

    // Restore memoized states
    if (functional) {
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

                if (hook instanceof StateHook$1) {
                    hook.context_ = virtualNode;
                }
            }
        }

        linkMemoizedHooks(virtualNode.path_, virtualNode.hooks_);
    }

    // Namespace
    virtualNode.ns_ = _determineNS(virtualNode);

    // Repeat with children
    resolveVirtualTree(virtualNode);
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
