import {hasOwnProperty, isNullish, isNumber, isString} from './Util';

export const updateNativeTextContent = (node, text) => {
    if (node.textContent !== text) {
        node.textContent = text;
    }
}

export const updateNativeElementAttributes = (element, newAttributes, oldAttributes) => {
    _updateKeyValues(
        element, newAttributes, oldAttributes,
        _updateElementAttribute, _removeElementAttribute
    );
}

const _updateElementAttribute = (element, attrName, newAttrValue, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(attrName);

    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], newAttrValue, oldAttrValue);
        return;
    }

    if (_canBeAttribute(attrName, newAttrValue)) {
        element.setAttribute(attrName, newAttrValue);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = newAttrValue;
        } catch (x) {
            // Property may not writable
        }
    }
}

const _removeElementAttribute = (element, attrName, oldAttrValue) => {
    attrName = _normalizeElementAttributeName(attrName);
    
    if (attrName === '') {
        return;
    }

    if (attrName === 'style') {
        _updateStyleProperties(element[attrName], null, oldAttrValue);

        // Clean up HTML code
        element.removeAttribute(attrName);
        return;
    }

    if (_canBeAttribute(attrName, oldAttrValue)) {
        element.removeAttribute(attrName);
        // Continue handle as properties
    }
    if (attrName in element) {
        try {
            element[attrName] = null;
        } catch (x) {
            // Property may not writable
        }
    }
}

const onEventRegex = /^on[A-Z]/;

const _normalizeElementAttributeName = (attrName) => {
    // Support React className
    if (attrName === 'className') {
        return 'class';
    }

    // Support camelcase event listener bindings
    if (onEventRegex.test(attrName)) {
        return attrName.toLowerCase();
    }

    return attrName;
}

const _canBeAttribute = (name, value) => {
    if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
        return false;
    }

    if (!(isString(value) || isNumber(value))) {
        return false;
    }

    return true;
}

const _updateStyleProperties = (style, newProperties, oldProperties) => {
    _updateKeyValues(
        style, newProperties, oldProperties,
        _updateStyleProperty, _removeStyleProperty
    );
}

const _updateStyleProperty = (style, propName, newPropValue) => {
    style[propName] = newPropValue;
}

const _removeStyleProperty = (style, propName) => {
    style[propName] = '';
}

const _updateKeyValues = (target, newKeyValues, oldKeyValues, updateFn, removeFn) => {
    const oldEmpty = isNullish(oldKeyValues);
    const newEmpty = isNullish(newKeyValues);

    let key;

    if (oldEmpty) {
        if (newEmpty) {
            // Do nothing here
        } else {
            for (key in newKeyValues) {
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    updateFn(target, key, newKeyValues[key]);
                }
            }
        }
    } else if (newEmpty) {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                removeFn(target, key, oldKeyValues[key]);
            }
        }
    } else {
        for (key in oldKeyValues) {
            if (_hasOwnNonEmpty(oldKeyValues, key)) {
                if (_hasOwnNonEmpty(newKeyValues, key)) {
                    // Do nothing here
                } else {
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
}

const _hasOwnNonEmpty = (target, prop) => {
    return (
        hasOwnProperty.call(target, prop)
        && !isNullish(target[prop])
    );
}
