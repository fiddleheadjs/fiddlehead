import {hasOwnProperty, isArray, isEmpty, isFunction, isNumber, isPlainObject, isString} from "./utils";


export function createViewTextNode(text) {
    return document.createTextNode(text);
}

export function createViewElementWithNS(ns, type, attributes) {
    const node = (ns !== null
            ? document.createElementNS(ns, type)
            : document.createElement(type)
    );

    updateViewElementAttributes(node, attributes, {});

    return node;
}

export function updateViewElementAttributes(element, newAttributes, oldAttributes) {
    for (let attrName in oldAttributes) {
        if (hasOwnProperty(oldAttributes, attrName)) {
            if (isEmpty(newAttributes[attrName])) {
                _removeViewElementAttribute(element, attrName, oldAttributes[attrName]);
            }
        }
    }

    for (let attrName in newAttributes) {
        if (hasOwnProperty(newAttributes, attrName)) {
            _setViewElementAttribute(element, attrName, newAttributes[attrName], oldAttributes[attrName]);
        }
    }
}

function _removeViewElementAttribute(element, attrName, attrValue) {
    const [name, value] = _transformViewElementAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    element.removeAttribute(name);
}

function _setViewElementAttribute(element, attrName, attrValue, oldAttrValue) {
    const [name, value] = _transformViewElementAttribute(attrName, attrValue);

    if (isEmpty(value)) {
        return;
    }

    if (name === 'style') {
        if (!isEmpty(oldAttrValue)) {
            const [, oldValue] = _transformViewElementAttribute(attrName, oldAttrValue);
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
            // The property is not writable
        }
    }
}

function _transformViewElementAttribute(name, value) {
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
        if (!isEmpty(value) && !isPlainObject(value)) {
            console.error('style must be a plain object', value);
            return [name, ];
        }
    }

    return [name, value];
}
