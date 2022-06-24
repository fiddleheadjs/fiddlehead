import {slice} from './Util';

/**
 *
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @constructor
 */
export function Element(type, props, content) {
    this.type_ = type;
    this.props_ = props;
    this.content_ = content;
}

/**
 * 
 * @param {string|function} type
 * @param {{}|null} props
 * @param {any} content
 * @returns {Element}
 */
export function createElement(type, props, content) {
    if (arguments.length > 3) {
        content = slice.call(arguments, 2);
    }
    
    return new Element(type, props, content);
}
