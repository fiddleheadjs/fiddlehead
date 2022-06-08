import {EMPTY_OBJECT} from './Constants';
import {hasOwnProperty, isObject} from './Util';

export function updateNativeElementAttributes(element, newAttributes, oldAttributes) {
    _updateKeyValues(
        element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
}

function _updateElementAttribute(element, attrName, newAttrValue, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        if (!isObject(newAttrValue)) {
            newAttrValue = EMPTY_OBJECT;
        }
        if (!isObject(oldAttrValue)) {
            oldAttrValue = EMPTY_OBJECT;
        }
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    // Set properties and event listeners
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
            return;
        } catch (x) {
            // Property may not writable
        }
    }

    // Anything else, treat as attributes
    element.setAttribute(attrName, newAttrValue);
}

function _removeElementAttribute(element, attrName, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);
    
    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        if (isObject(oldAttrValue)) {
            _updateStyleProperties(element[attrName], EMPTY_OBJECT, oldAttrValue);
        }

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    // Remove properties and event listeners
    if (attrName in element) {
        try {
            element[attrName] = null;
            return;
        } catch (x) {
            // Property may not writable
        }
    }

    // Anything else, treat as attributes
    element.removeAttribute(attrName);
}

function _normalizeElementAttributeName(attrName) {
    // Support React className
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
    if (/^on[A-Z]/.test(attrName)) {
        return attrName.toLowerCase();
    }

    return attrName;
}

function _updateStyleProperties(style, newProperties, oldProperties) {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
}

function _updateStyleProperty(style, propName, newPropValue) {
    style[propName] = newPropValue;
}

function _removeStyleProperty(style, propName) {
    style[propName] = '';
}

function _updateKeyValues(target, newKeyValues, oldKeyValues, updateFn, removeFn) {
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
}

function _hasOwnNonEmpty(target, prop) {
    return (
        hasOwnProperty.call(target, prop) &&
        target[prop] !== undefined &&
        target[prop] !== null
    );
}
