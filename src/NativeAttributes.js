import {hasOwnProperty, isNullish, isNumber, isString} from './Util';

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
            if (__DEV__) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
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

    // Cases: properties, event listeners
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            if (__DEV__) {
                console.error(`Property \`${attrName}\` is not writable`);
            }
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
    return hasOwnProperty.call(target, prop) && !isNullish(target[prop]);
}
