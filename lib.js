/**
 *
 * @type {Object<Fiber>}
 */
const fiberMap = {};

const normallyEmptyAppendedNodeArray = [];

window.HookInternals = {
    fiberMap,
    normallyEmptyAppendedNodeArray,
};

const CONTAINER_ID_KEY = 'Hook$ContainerId';
const COMPONENT_TYPE_KEY = 'Hook$ComponentType';

/**
 *
 * @param {function} Component
 * @param {{}} props
 * @returns {Fiber}
 * @constructor
 */
function Fiber(Component, props) {
    this.Component = Component;
    this.props = props;
    this.hooks = [];
    this.virtualNode = null;
}

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
    this.fiber = null;

    this.parent = null;
    this.children = [];
    this.path = [];
    this.resolvePath = null;

    this.htmlNode = null;
    this.setHtmlNode = (htmlNode) => {
        this.htmlNode = htmlNode;

        if (this.ref instanceof RefHook) {
            this.ref.current = htmlNode;
        }
    };
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
    if (!hasOwnProperty(root, CONTAINER_ID_KEY)) {
        root[CONTAINER_ID_KEY] = '~' + (++containerIdInc);
    }
    return root[CONTAINER_ID_KEY];
}

let componentTypeInc = 0;
function getComponentType(Component) {
    if (!hasOwnProperty(Component, COMPONENT_TYPE_KEY)) {
        Component[COMPONENT_TYPE_KEY] = '$' + (++componentTypeInc);
    }
    return Component[COMPONENT_TYPE_KEY];
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
        throw new Error('Cannot call hook from outside of the Hook component');
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

            if (typeof value === 'function') {
                newValue = value(hook.value);
            } else {
                newValue = value;
            }

            if (newValue !== hook.value) {
                hook.value = newValue;
                updateComponent(fiber.virtualNode);
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
            throw new Error('useEffect: Dependencies must be size-fixed');
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
    // const unmountedNodes = [];
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key)) {
            const unmounted = !hasOwnProperty(newVirtualNodeMap, key);
            const virtualNode = oldVirtualNodeMap[key];
            const fiber = virtualNode.fiber;

            if (fiber !== null) {
                destroyEffectsByFiber(fiber, unmounted);

                if (unmounted) {
                    unlinkFiber(virtualNode.path);
                }
            }

            // if (unmounted) {
            //     unmountedNodes.push(virtualNode);
            // }
        }
    }
    // console.log('unmounted', unmountedNodes);
}

function resolveMountedNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // const mountedNodes = [];
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            const mounted = !hasOwnProperty(oldVirtualNodeMap, key);
            const virtualNode = newVirtualNodeMap[key];
            const fiber = virtualNode.fiber;

            if (fiber !== null) {
                mountEffectsByFiber(fiber, mounted);
            }

            // if (mounted) {
            //     mountedNodes.push(virtualNode);
            // }
        }
    }
    // console.log('mounted', mountedNodes);
}

function updateComponent(oldRootVirtualNode, isInit = false) {
    const walk = (virtualNode, parentVirtualNode = null) => {
        if (virtualNode.type === '#text') {
            return virtualNode;
        }

        const fiber = virtualNode.fiber;

        if (fiber === null) {
            virtualNode.children.forEach(childVirtualNode => {
                walk(childVirtualNode, virtualNode);
            });

            return virtualNode;
        }

        {
            prepareCurrentlyRendering(fiber);
            const newVirtualNode = fiber.Component(fiber.props);
            flushCurrentlyRendering();

            resolveTree(newVirtualNode, virtualNode.path);

            fiber.virtualNode = newVirtualNode;
            newVirtualNode.fiber = fiber;
            newVirtualNode.parent = parentVirtualNode;

            // TODO: Research more about this
            // I don't know why need to check instanceof
            // If assign to html node, old ref is set, new ref is NOT set
            // But if assign to fiber node, old ref is NOT set, new ref is set
            if (virtualNode.ref instanceof RefHook) {
                newVirtualNode.ref = virtualNode.ref;
            }

            if (parentVirtualNode !== null) {
                const index = parentVirtualNode.children.indexOf(virtualNode);
                if (index >= 0) {
                    parentVirtualNode.children[index] = newVirtualNode;
                }
            }

            newVirtualNode.children.forEach(childVirtualNode => {
                walk(childVirtualNode, newVirtualNode);
            });

            return newVirtualNode;
        }
    };

    const newRootVirtualNode = walk(oldRootVirtualNode, oldRootVirtualNode.parent);
    finishResolveTree();

    const oldVirtualNodeMap = isInit ? {} : parseTree(oldRootVirtualNode);
    const newVirtualNodeMap = parseTree(newRootVirtualNode);

    resolveUnmountedNodes(oldVirtualNodeMap, newVirtualNodeMap);

    hydrateVirtualNodes(newRootVirtualNode);

    commitToHTML(oldVirtualNodeMap, newVirtualNodeMap);

    resolveMountedNodes(oldVirtualNodeMap, newVirtualNodeMap);

    return newRootVirtualNode;
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
        return createStaticNode('#fragment', attributes, ...content);
    }

    if (typeof type === 'function') {
        return createFiberNode(type, attributes, ...content);
    }

    return createStaticNode(type, attributes, ...content);
}

function createFiberNode(type, attributes, ...content) {
    const {key = null, ref = null, ...props} = attributes;
    props.children = content;

    const tempPath = generateTemporaryPath();

    const fiber = new Fiber(type, props);

    linkFiber(tempPath, fiber);

    const virtualNode = new VirtualNode(null, props, key, ref);

    virtualNode.resolvePath = () => {
        unlinkFiber(tempPath);

        const existedFiber = findFiber(virtualNode.path);
        if (existedFiber) {
            existedFiber.props = fiber.props;
            existedFiber.virtualNode = virtualNode;
            virtualNode.fiber = existedFiber;
        } else {
            linkFiber(virtualNode.path, fiber);
        }
    };

    // Associate virtualNode and fiber
    virtualNode.fiber = fiber;
    fiber.virtualNode = virtualNode;

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
        let virtualNode = item;
        if (['string', 'number'].includes(typeof item)) {
            virtualNode = new VirtualNode('#text', {}, null, null);
            virtualNode.text = item;
        }

        if (virtualNode instanceof VirtualNode) {
            element.children.push(virtualNode);
            normallyEmptyAppendedNodeArray.push(
                new AppendInfo(element, indexes, virtualNode)
            );
        }
    };
    const appendRecursively = function (content, indexes) {
        if (content instanceof Array) {
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
            if (virtualNode.fiber !== null) {
                currentPath.push(getComponentType(virtualNode.fiber.Component));
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

        if (virtualNode.resolvePath !== null) {
            virtualNode.resolvePath();
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
        let htmlNode = null;

        if (virtualNode.type === '#fragment') {
        }
        else if (virtualNode.type === '#text') {
            htmlNode = document.createTextNode(virtualNode.text);
        }
        else if (typeof virtualNode.type === 'string') {
            htmlNode = createHTMLElement(virtualNode.type, virtualNode.props);
        }

        virtualNode.setHtmlNode(htmlNode);

        virtualNode.children.forEach(childVirtualNode => {
            walk(childVirtualNode);
        });
    };

    walk(virtualNode);
}

function commitToHTML(oldVirtualNodeMap, newVirtualNodeMap) {
    removeOldHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap);
    updateExistingHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap);
    insertNewHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap);
}

function removeOldHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    // If the current node is under the last removed node
    // So dont need to remove current node anymore
    // Use lastRemovedKey to track
    let lastRemovedKey = '';
    for (let key in oldVirtualNodeMap) {
        if (hasOwnProperty(oldVirtualNodeMap, key) && !hasOwnProperty(newVirtualNodeMap, key)) {
            if (!key.startsWith(lastRemovedKey + '/')) {
                const oldVirtualNode = oldVirtualNodeMap[key];
                removeHtmlNodesOfVirtualNode(oldVirtualNode);
                lastRemovedKey = key;
            }
        }
    }
}

function updateExistingHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    const keys = Object.keys({...oldVirtualNodeMap, ...newVirtualNodeMap});
    keys.forEach(key => {
        if (hasOwnProperty(oldVirtualNodeMap, key) && hasOwnProperty(newVirtualNodeMap, key)) {
            const oldVirtualNode = oldVirtualNodeMap[key];
            const newVirtualNode = newVirtualNodeMap[key];

            newVirtualNode.setHtmlNode(oldVirtualNode.htmlNode);

            {
                const {htmlNode, props, type} = newVirtualNode;
                if (type === '#text') {
                    if (newVirtualNode.text !== oldVirtualNode.text) {
                        htmlNode.textContent = newVirtualNode.text;
                    }
                } else {
                    setAttributes(htmlNode, props);
                }
            }
        }
    });
}

function insertNewHtmlNodes(oldVirtualNodeMap, newVirtualNodeMap) {
    let pendingVirtualNodes = [];
    
    for (let key in newVirtualNodeMap) {
        if (hasOwnProperty(newVirtualNodeMap, key)) {
            if (!hasOwnProperty(oldVirtualNodeMap, key)) {
                pendingVirtualNodes.push(newVirtualNodeMap[key]);
            } else {
                insertClosestHtmlNodesOfVirtualNodes(pendingVirtualNodes, oldVirtualNodeMap[key]);
                pendingVirtualNodes.length = 0;
            }
        }
    }

    if (pendingVirtualNodes.length > 0) {
        insertClosestHtmlNodesOfVirtualNodes(pendingVirtualNodes, null);
    }
}

function insertClosestHtmlNodesOfVirtualNodes(virtualNodes, virtualNodeAfter) {
    const htmlNodeAfter = virtualNodeAfter && findClosestHtmlNodes(virtualNodeAfter)[0] || null;
    
    virtualNodes.forEach(virtualNode => {
        if (virtualNode.htmlNode !== null) {
            const htmlHost = findHtmlHost(virtualNode);
            
            if (htmlNodeAfter !== null && htmlHost === htmlNodeAfter.parentNode) {
                htmlHost.insertBefore(virtualNode.htmlNode, htmlNodeAfter);
            } else {
                htmlHost.appendChild(virtualNode.htmlNode);
            }
        }
    });
}

function removeHtmlNodesOfVirtualNode(virtualNode) {
    findClosestHtmlNodes(virtualNode).forEach(htmlNode => {
        if (htmlNode.parentNode !== null) {
            htmlNode.parentNode.removeChild(htmlNode);
        }
    });
}

function findHtmlHost(virtualNode) {
    if (!virtualNode.parent) {
        return null;
    }

    if (virtualNode.parent.htmlNode !== null) {
        return virtualNode.parent.htmlNode;
    }

    return findHtmlHost(virtualNode.parent);
}

function findClosestHtmlNodes(virtualNode) {
    if (virtualNode.htmlNode !== null) {
        return [virtualNode.htmlNode];
    } else {
        return virtualNode.children.reduce((arr, childVirtualNode) => {
            return arr.concat(findClosestHtmlNodes(childVirtualNode));
        }, []);
    }
}

function render(rootVirtualNode, container) {
    resolveTree(rootVirtualNode, [getContainerId(container)]);
    finishResolveTree();

    const containerVirtualNode = new VirtualNode(container.nodeName.toLowerCase(), {}, null, null);
    containerVirtualNode.setHtmlNode(container);

    rootVirtualNode.parent = containerVirtualNode;

    updateComponent(rootVirtualNode, true);
}


//============================


const SVG_TAGS = [
    'svg',
    'g',
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
];

function createHTMLElement(type, attributes) {
    const node = SVG_TAGS.includes(type)
        ? document.createElementNS("http://www.w3.org/2000/svg", type)
        : document.createElement(type);

    setAttributes(node, attributes);

    return node;
}

/**
 * sets attributes for a node
 *
 * @param {HTMLElement} element
 * @param {object} attributes
 */
function setAttributes(element, attributes) {
    for (let attrName in attributes) {
        if (hasOwnProperty(attributes, attrName)) {
            setAttribute(element, attrName, attributes[attrName]);
        }
    }
}

function setAttribute(element, attrName, attrValue) {
    const [name, value] = transformAttribute(attrName, attrValue);

    if (name === 'style') {
        // TODO: Compare with old style to update exactly what changed
        for (let prop in value) {
            if (hasOwnProperty(value, prop)) {
                if (value[prop] !== undefined) {
                    element.style[prop] = value[prop];
                }
            }
        }
        return;
    }

    if (['function', 'boolean'].includes(typeof value)) {
        element[name] = value;
        return;
    }

    if (value !== undefined) {
        element.setAttribute(name, value);
    }
}

function transformAttribute(name, value) {
    const valueType = typeof value;

    if (valueType === 'function') {
        return [name.toLowerCase(), value];
    }

    if (name === 'class' || name === 'className') {
        if (valueType === 'string') {
            return ['class', value];
        } else {
            // Array of class names
            return ['class', value.filter(t => typeof t === 'string').join(' ')];
        }
    }

    return [name, value];
}


// ========================


function hasOwnProperty(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
}


// ========================


export default {
    $: createElement,
    render,
    useState,
    useEffect,
    useRef,
};
