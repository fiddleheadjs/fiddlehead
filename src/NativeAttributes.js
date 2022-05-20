import {hasOwnProperty, isEmpty, isNumber, isString} from './Util';

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
        _updateStyleProperties(element.style, newAttrValue, oldAttrValue);
        return;
    }

    if (isString(newAttrValue) || isNumber(newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        return;
    }

    if (/^on[A-Z]/.test(attrName)) {
        element.addEventListener()
    }

    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
        } catch (e) {
            // The property is not writable
        }
    }
}

function _removeElementAttribute(element, attrName, oldAttrValue) {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (isString(oldAttrValue) || isNumber(oldAttrValue)) {
        element.removeAttribute(attrName);
        return;
    }

    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (e) {
            // The property is not writable
        }
    }
}

function _normalizeElementAttributeName(attrName) {
    if (attrName === 'class') {
        if (__DEV__) {
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
}

function _updateStyleProperties(style, newProperties, oldProperties) {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
}

function _updateStyleProperty(style, propName, newPropValue, oldPropValue) {
    style[propName] = newPropValue;
}

function _removeStyleProperty(style, propName, oldPropValue) {
    style[propName] = '';
}

function _updateKeyValues(target, newKeyValues, oldKeyValues, updateFn, removeFn) {
    let key, normKey;
    
    for (key in oldKeyValues) {
        if (hasOwnProperty(oldKeyValues, key) && !isEmpty(oldKeyValues[key])) {
            if (!hasOwnProperty(newKeyValues, key)) {
                removeFn(target, normKey, oldKeyValues[key]);
            }
        }
    }

    for (key in newKeyValues) {
        if (hasOwnProperty(newKeyValues, key) && !isEmpty(newKeyValues[key])) {
            updateFn(target, normKey, newKeyValues[key], oldKeyValues[key]);
        }
    }
}
