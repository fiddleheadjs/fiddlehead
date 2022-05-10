/**
 *
 * @type {Object<Fiber>}
 */
const fiberMap = {};

/**
 * 
 * @type {Array<AppendInfo>}
 */
const normallyEmptyAppendedNodeArray = [];

const PROP_COMPONENT_TYPE = 'Hook$ComponentType';
const PROP_CONTAINER_ID = 'Hook$ContainerId';
const PROP_VIRTUAL_NODE = 'Hook$VirtualNode';

/**
 *
 * @param {string|function} type
 * @param {{}} props
 * @param {string|null} key
 * @param {RefHook|null} ref
 * @return {VirtualNode}
 * @constructor
 */
function VirtualNode(type, props, key, ref) {
    this.type = type;
    this.props = props;
    this.key = key;
    this.ref = ref;
    
    this.hooks = [];

    this.parent = null;
    this.children = [];
    this.path = [];

    this.viewNode = null;
    this.ns = null;
}

const NODE_TEXT = '#txt';
const NODE_FRAGMENT = '#frg';

const NS_HTML = 'html';
const NS_SVG = 'svg';

function linkViewNode(virtualNode, viewNode) {
    virtualNode.viewNode = viewNode;

    if (virtualNode.ref instanceof RefHook) {
        virtualNode.ref.current = viewNode;
    }
}

/**
 *
 * @param {*} current
 * @constructor
 */
function RefHook(current) {
    this.current = current;
}

/**
 *
 * @param {*} value
 * @param {function} setValue
 * @return {StateHook}
 * @constructor
 */
function StateHook(value, setValue) {
    this.value = value;
    this.setValue = setValue;
}

const EFFECT_NONE = 0;
const EFFECT_ALWAYS = 1;
const EFFECT_LAZY = 2;
const EFFECT_DEPS = 3;
const EFFECT_DEPS_CHANGED = 4;

/**
 *
 * @param {function} callback
 * @param {[]?} deps
 * @param {function?} lastDestroy
 * @return {EffectHook}
 * @constructor
 */
function EffectHook(callback, deps, lastDestroy) {
    this.tag = EFFECT_NONE;
    this.callback = callback;
    this.deps = deps;
    this.destroy = undefined;
    this.lastDestroy = lastDestroy;
}

/**
 *
 * @param {VirtualNode|null} parent
 * @param {[]} routeFromParent
 * @param {VirtualNode} current
 * @return {AppendInfo}
 * @constructor
 */
function AppendInfo(parent, routeFromParent, current) {
    this.parent = parent;
    this.routeFromParent = routeFromParent;
    this.current = current;
}

/**
 *
 * @type {Fiber|null}
 */
let currentlyRenderingFiber = null;
let currentHookIndex = -1;

let containerIdInc = 0;
function getContainerId(root) {
    if (!hasOwnProperty(root, PROP_CONTAINER_ID)) {
        root[PROP_CONTAINER_ID] = '~' + (++containerIdInc);
    }
    return root[PROP_CONTAINER_ID];
}

let componentTypeInc = 0;
/**
 * 
 * @param {Function} Component 
 * @returns {string}
 */
function getComponentType(Component) {
    if (!hasOwnProperty(Component, PROP_COMPONENT_TYPE)) {
        Component[PROP_COMPONENT_TYPE] = Component.name + '$' + (++componentTypeInc);
    }
    return Component[PROP_COMPONENT_TYPE];
}

let componentTempPathDec = 0;
function generateTemporaryPath() {
    return [--componentTempPathDec];
}

function stringifyPath(path) {
    return path.join('/');
}

function prepareCurrentlyRendering(fiber) {
    currentlyRenderingFiber = fiber;
    currentHookIndex = -1;
}

function flushCurrentlyRendering() {
    currentlyRenderingFiber = null;
    currentHookIndex = -1;
}

function findFiber(path) {
    const pathString = stringifyPath(path);

    if (hasOwnProperty(fiberMap, pathString)) {
        return fiberMap[pathString];
    }

    return null;
}

function linkFiber(path, fiber) {
    fiberMap[stringifyPath(path)] = fiber;
}

function unlinkFiber(path) {
    delete fiberMap[stringifyPath(path)];
}

function resolveCurrentlyRunningFiber() {
    if (currentlyRenderingFiber === null) {
        throw new Error('Cannot call hooks from outside of the component');
    }

    return currentlyRenderingFiber;
}

function useRef(initialValue) {
    const fiber = resolveCurrentlyRunningFiber();

    currentHookIndex++;

    if (fiber.hooks.length > currentHookIndex) {
        return fiber.hooks[currentHookIndex];
    }

    const hook = new RefHook(initialValue);

    fiber.hooks.push(hook);

    return hook;
}

function useState(initialValue) {
    const fiber = resolveCurrentlyRunningFiber();

    currentHookIndex++;

    if (fiber.hooks.length > currentHookIndex) {
        const hook = fiber.hooks[currentHookIndex];
        return [hook.value, hook.setValue];
    }

    const hook = new StateHook(
        initialValue,
        (value) => {
            let newValue;

            if (isFunction(value)) {
                newValue = value(hook.value);
            } else {
                newValue = value;
            }

            if (newValue !== hook.value) {
                hook.value = newValue;
                updateComponent(fiber);
            }
        }
    );

    fiber.hooks.push(hook);

    return [hook.value, hook.setValue];
}

function useEffect(callback, deps = null) {
    const fiber = resolveCurrentlyRunningFiber();

    currentHookIndex++;

    if (fiber.hooks.length > currentHookIndex) {
        /**
         * @type {EffectHook}
         */
        const currentHook = fiber.hooks[currentHookIndex];

        if (!(
            deps === null && currentHook.deps === null ||
            deps.length === currentHook.deps.length
        )) {
            throw new Error('Deps must be size-fixed');
        }

        const effectTag = getEffectTag(deps, currentHook.deps);

        if (effectTag === EFFECT_LAZY) {
            return;
        }

        if (effectTag === EFFECT_DEPS) {
            currentHook.tag = effectTag;
            return;
        }

        if (effectTag === EFFECT_ALWAYS || effectTag === EFFECT_DEPS_CHANGED) {
            const newHook = new EffectHook(callback, deps, currentHook.destroy);
            newHook.tag = effectTag;
            fiber.hooks[currentHookIndex] = newHook;
            return;
        }

        return;
    }

    const hook = new EffectHook(callback, deps);
    hook.tag = getEffectTag(deps);

    fiber.hooks.push(hook);
}

function getEffectTag(deps, lastDeps = false) {
    // Always
    if (deps === null) {
        return EFFECT_ALWAYS;
    }

    // Lazy
    if (deps.length === 0) {
        return EFFECT_LAZY;
    }

    // Deps
    if (lastDeps === false || compareArrays(deps, lastDeps)) {
        return EFFECT_DEPS;
    }

    // DepsChanged
    {
        return EFFECT_DEPS_CHANGED;
    }
}

function compareArrays(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 *
 * @param {EffectHook} effectHook
 */
function mountEffectHook(effectHook) {
    effectHook.destroy = effectHook.callback();
}

/**
 *
 * @param {EffectHook} hook
 * @param {boolean} isNodeUnmounted
 */
function destroyEffectHook(hook, isNodeUnmounted = false) {
    if (hook.lastDestroy !== undefined && !isNodeUnmounted) {
        hook.lastDestroy();
        return;
    }

    if (hook.destroy !== undefined) {
        hook.destroy();
    }
}

/**
 *
 * @param {Fiber} fiber
 * @param {boolean} isNewNodeMounted
 */
function mountEffectsByFiber(fiber, isNewNodeMounted) {
    fiber.hooks.forEach(hook => {
        if (!(hook instanceof EffectHook)) {
            return;
        }

        if (isNewNodeMounted || hook.tag === EFFECT_ALWAYS || hook.tag === EFFECT_DEPS_CHANGED) {
            mountEffectHook(hook);
        }
    });
}

/**
 *
 * @param {Fiber} fiber
 * @param {boolean} isNodeUnmounted
 */
function destroyEffectsByFiber(fiber, isNodeUnmounted) {
    fiber.hooks.forEach(hook => {
        if (!(
            hook instanceof EffectHook &&
            (hook.lastDestroy !== undefined || hook.destroy !== undefined)
        )) {
            return;
        }

        if (isNodeUnmounted || hook.tag === EFFECT_ALWAYS || hook.tag === EFFECT_DEPS_CHANGED) {
            destroyEffectHook(hook, isNodeUnmounted);
        }
    });
}

function parseTree(rootVirtualNode) {
    const out = {};

    const walk = (virtualNode) => {
        out[stringifyPath(virtualNode.path)] = virtualNode;

        virtualNode.children.forEach(childVirtualNode => {
            walk(childVirtualNode);
        });
    };

    walk(rootVirtualNode);

    return out;
}

function resolveUnmountedNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                destroyEffectsByFiber(virtualNode, unmounted);

                if (unmounted) {
                    unlinkFiber(virtualNode.path);
                }
            }
        }
    }
}

function resolveMountedNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            const mounted = !hasOwnProperty(oldVirtualNodeMap, key);
            const virtualNode = newVirtualNodeMap[key];

            if (isFunction(virtualNode.type)) {
                mountEffectsByFiber(virtualNode, mounted);
            }
        }
    }
}

/**
 * 
 * @param {VirtualNode} virtualNode 
 */
function updateVirtualTree(virtualNode) {
    if (virtualNode.type === NODE_TEXT) {
        return;
    }

    if (!isFunction(virtualNode.type)) {
        virtualNode.children.forEach(childVirtualNode => {
            updateVirtualTree(childVirtualNode);
        });
        return;
    }

    {
        prepareCurrentlyRendering(virtualNode);
        const newVirtualNode = virtualNode.type(virtualNode.props);
        flushCurrentlyRendering();

        resolveTree(newVirtualNode, virtualNode.path);
        
        newVirtualNode.parent = virtualNode;
        virtualNode.children[0] = newVirtualNode;

        updateVirtualTree(newVirtualNode);
    }
}

/**
 * 
 * @param {VirtualNode} rootVirtualNode 
 * @param {boolean} isInit 
 */
function updateComponent(rootVirtualNode, isInit = false) {
    const oldVirtualNodeMap = isInit ? {} : parseTree(rootVirtualNode);
    updateVirtualTree(rootVirtualNode, rootVirtualNode.parent);
    finishResolveTree();
    const newVirtualNodeMap = parseTree(rootVirtualNode);

    resolveUnmountedNodes(oldVirtualNodeMap, newVirtualNodeMap);
    hydrateVirtualNodes(rootVirtualNode);
    commitToHTML(oldVirtualNodeMap, newVirtualNodeMap);
    resolveMountedNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

/**
 * creates an element with certain content and attributes
 *
 * @param {string|function} type
 * @param {{}?} attributes
 * @param {[]} content
 * @return {VirtualNode}
 */
function createElement(type, attributes, ...content) {
    attributes = attributes || {};

    if (type === null) {
        return createStaticNode(NODE_FRAGMENT, attributes, ...content);
    }

    if (isFunction(type)) {
        return createFiberNode(type, attributes, ...content);
    }

    return createStaticNode(type, attributes, ...content);
}

function createFiberNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;
    props.children = content;

    const tempPath = generateTemporaryPath();

    const virtualNode = new VirtualNode(type, props, key, ref);
    linkFiber(tempPath, virtualNode);

    virtualNode.resolvePath = () => {
        unlinkFiber(tempPath);

        const existing = findFiber(virtualNode.path);
        if (existing) {
            virtualNode.hooks = existing.hooks;
        }

        linkFiber(virtualNode.path, virtualNode);
    };

    return virtualNode;
}

function createStaticNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;

    const virtualNode = new VirtualNode(type, props, key, ref);

    appendVirtualChildren(virtualNode, content);

    return virtualNode;
}

function appendVirtualChildren(element, content) {
    const append = function (item, indexes) {
        let virtualNode;

        if (isString(item) || isNumber(item)) {
            virtualNode = new VirtualNode(NODE_TEXT, {}, null, null);
            virtualNode.text = String(item);
        } else {
            virtualNode = item;
        }

        if (virtualNode instanceof VirtualNode) {
            element.children.push(virtualNode);
            normallyEmptyAppendedNodeArray.push(
                new AppendInfo(element, indexes, virtualNode)
            );
        }
    };
    const appendRecursively = function (content, indexes) {
        if (isArray(content)) {
            content.forEach(function (item, idx) {
                appendRecursively(item, [...indexes, idx]);
            });
        } else {
            append(content, indexes);
        }
    }
    appendRecursively(content, []);
}

function escapeKey(key) {
    return '@' + encodeURIComponent(key);
}

function resolveTree(rootVirtualNode, basePath = []) {
    const rootAppendInfo = new AppendInfo(null, [], rootVirtualNode);
    let arr = normallyEmptyAppendedNodeArray.slice(0);
    let currentPath = [...basePath];

    /**
     *
     * @param {AppendInfo} appendInfo
     * @param {VirtualNode} virtualNode
     */
    const walk = (appendInfo, virtualNode) => {
        const pivotPathSize = currentPath.length;

        if (virtualNode !== rootVirtualNode) {
            currentPath.push(...appendInfo.routeFromParent);

            // If a node has key, replace the index of this node
            // in the children node list of the parent
            // by the key
            if (virtualNode.key !== null) {
                currentPath.pop();
                currentPath.push(escapeKey(virtualNode.key));
            }

            // Add the component type to the current path
            if (isFunction(virtualNode.type)) {
                currentPath.push(getComponentType(virtualNode.type));
            } else {
                currentPath.push(virtualNode.type);
            }
        }

        arr = arr.filter(item => {
            if (item.parent === appendInfo.current) {
                walk(item, item.current);
                return false;
            }
            return true;
        });

        virtualNode.path = [...currentPath];
        virtualNode.parent = appendInfo.parent;

        if (virtualNode.resolvePath !== undefined) {
            virtualNode.resolvePath();
            delete virtualNode.resolvePath;
        }

        currentPath.length = pivotPathSize;
    }

    walk(rootAppendInfo, rootVirtualNode);

    return rootVirtualNode;
}

function finishResolveTree() {
    normallyEmptyAppendedNodeArray.length = 0;
}

function hydrateVirtualNodes(virtualNode) {
    const walk = (virtualNode) => {
        // Determine the namespace
        if (virtualNode.type === 'svg') {
            virtualNode.ns = NS_SVG;
        } else {
            if (virtualNode.parent !== null) {
                virtualNode.ns = virtualNode.parent.ns;
            } else {
                virtualNode.ns = NS_HTML;
            }
        }

        // Create the view node
        let viewNode = null;

        if (virtualNode.type === NODE_TEXT) {
            viewNode = document.createTextNode(virtualNode.text);
        } else if (virtualNode.type === NODE_FRAGMENT) {
            // Do nothing here
            // But be careful, removing it changes the condition
        } else if (isString(virtualNode.type)) {
            let viewNS = null;
            if (virtualNode.ns === NS_SVG) {
                viewNS = 'http://www.w3.org/2000/svg';
            }
            viewNode = createDOMElementNS(viewNS, virtualNode.type, virtualNode.props);

            // For debug
            viewNode[PROP_VIRTUAL_NODE] = virtualNode;
        }

        linkViewNode(virtualNode, viewNode);

        // Continue with the children
        virtualNode.children.forEach(childVirtualNode => {
            walk(childVirtualNode);
        });
    };

    walk(virtualNode);
}

function commitToHTML(oldVirtualNodeMap, newVirtualNodeMap) {
    removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
    insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function removeOldViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                removeViewNodesOfVirtualNode(oldVirtualNode);
                lastRemovedKey = key;
            }
        }
    }
}

function updateExistingViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const keys = Object.keys({...oldVirtualNodeMap, ...newVirtualNodeMap});
    keys.forEach(key => {
        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const oldVirtualNode = oldVirtualNodeMap[key];
            const newVirtualNode = newVirtualNodeMap[key];

            linkViewNode(newVirtualNode, oldVirtualNode.viewNode);

            if (newVirtualNode.type === NODE_TEXT) {
                if (newVirtualNode.text !== oldVirtualNode.text) {
                    newVirtualNode.viewNode.textContent = newVirtualNode.text;
                }
            } else {
                setAttributes(newVirtualNode.viewNode, newVirtualNode.props, oldVirtualNode.props);
            }
        }
    });
}

function insertNewViewNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];

    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                pendingVirtualNodes.push(newVirtualNodeMap[key]);
            } else {
                insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        insertClosestViewNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function insertClosestViewNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const viewNodeAfter = virtualNodeAfter && findClosestViewNodes(virtualNodeAfter)[0] || null;

    virtualNodes.forEach(virtualNode => {
        if (virtualNode.viewNode !== null) {
            const viewHost = findViewHost(virtualNode);

            if (viewHost !== null) {
                if (viewNodeAfter !== null && viewHost === viewNodeAfter.parentNode) {
                    viewHost.insertBefore(virtualNode.viewNode, viewNodeAfter);
                } else {
                    viewHost.appendChild(virtualNode.viewNode);
                }
            }
        }
    });
}

function removeViewNodesOfVirtualNode(virtualNode) {
    findClosestViewNodes(virtualNode).forEach(viewNode => {
        if (viewNode.parentNode !== null) {
            viewNode.parentNode.removeChild(viewNode);
        }
    });
}

function findViewHost(virtualNode) {
    if (virtualNode.parent === null) {
        return null;
    }

    if (virtualNode.parent.viewNode === null) {
        return findViewHost(virtualNode.parent);
    }

    return virtualNode.parent.viewNode;
}

function findClosestViewNodes(virtualNode) {
    if (virtualNode.viewNode !== null) {
        return [virtualNode.viewNode];
    } else {
        return virtualNode.children.reduce((arr, childVirtualNode) => {
            return arr.concat(findClosestViewNodes(childVirtualNode));
        }, []);
    }
}

function render(rootVirtualNode, container) {
    resolveTree(rootVirtualNode, [getContainerId(container)]);
    finishResolveTree();

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);

    linkViewNode(containerVirtualNode, container);

    rootVirtualNode.parent = containerVirtualNode;

    if (container.ownerSVGElement) {
        containerVirtualNode.ns = NS_SVG;
    } else {
        containerVirtualNode.ns = NS_HTML;
    }

    updateComponent(rootVirtualNode, true);
}


//============================
// DOM manipulation
// ===========================

function createDOMElementNS(ns, type, attributes) {
    const node = (ns !== null
        ? document.createElementNS(ns, type)
        : document.createElement(type)
    );

    setAttributes(node, attributes, {});

    return node;
}

function setAttributes(element, attributes, oldAttributes) {
    for (let attrName in oldAttributes) {
        if (hasOwnProperty(oldAttributes, attrName)) {
            if (isEmpty(attributes[attrName])) {
                removeAttribute(element, attrName, oldAttributes[attrName]);
            }
        }
    }

    for (let attrName in attributes) {
        if (hasOwnProperty(attributes, attrName)) {
            setAttribute(element, attrName, attributes[attrName], oldAttributes[attrName]);
        }
    }
}

function removeAttribute(element, attrName, attrValue) {
    const [name, value] = transformAttribute(attrName, attrValue);
    
    if (isEmpty(value)) {
        return;
    }

    element.removeAttribute(name);
}

function setAttribute(element, attrName, attrValue, oldAttrValue) {
    const [name, value] = transformAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    if (name === 'style') {
        if (!isEmpty(oldAttrValue)) {
            const [, oldValue] = transformAttribute(attrName, oldAttrValue);
            if (!isEmpty(oldValue)) {
                for (let prop in oldValue) {
                    if (hasOwnProperty(oldValue, prop) && !hasOwnProperty(value, prop)) {
                        // Delete this style property
                        element.style[prop] = '';
                    }
                }
            }
        }

        for (let prop in value) {
            if (hasOwnProperty(value, prop)) {
                if (!isEmpty(value[prop])) {
                    element.style[prop] = value[prop];
                }
            }
        }

        return;
    }

    if (isString(value) || isNumber(value)) {
        element.setAttribute(name, value);
    }

    // For properties, event listeners
    if (name in element) {
        try {
            element[name] = value;
        } catch (e) {
            // The property is not wriable
        }
    }
}

function transformAttribute(name, value) {
    if (isFunction(value)) {
        return [name.toLowerCase(), value];
    }
    
    if (name === 'className') {
        if (isArray(value)) {
            return ['class', value.filter(t => isString(t)).join(' ')];
        } else {
            return ['class', value];
        }
    }

    if (name === 'class') {
        console.error('className instead of class');
        return [name, ];
    }
    
    if (name === 'style') {
        if (!isPlainObject(value)) {
            console.error('style must be a plain object', value);
            return [name, ];
        }
    }

    return [name, value];
}


//============================
// Helpers
// ===========================


function hasOwnProperty(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

function isBoolean(value) {
    return value === true || value === false || value instanceof Boolean;
}

function isFunction(value) {
    return value instanceof Function;
}

function isArray(value) {
    return value instanceof Array;
}

function isPlainObject(value) {
    return (!!value) && (value.constructor === Object);
}

function isEmpty(value) {
    return value === undefined || value === null;
}


//============================
// Exports
// ===========================


export {
    createElement as h,
    render,
    useState,
    useEffect,
    useRef,
};
