(()=>{"use strict";var n={112:(n,t)=>{var r=["key","ref"];function e(n,t){if(null==n)return{};var r,e,o=function(n,t){if(null==n)return{};var r,e,o={},l=Object.keys(n);for(e=0;e<l.length;e++)r=l[e],t.indexOf(r)>=0||(o[r]=n[r]);return o}(n,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(n);for(e=0;e<l.length;e++)r=l[e],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(n,r)&&(o[r]=n[r])}return o}function o(n,t){return function(n){if(Array.isArray(n))return n}(n)||function(n,t){var r=null==n?null:"undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(null!=r){var e,o,l=[],i=!0,u=!1;try{for(r=r.call(n);!(i=(e=r.next()).done)&&(l.push(e.value),!t||l.length!==t);i=!0);}catch(n){u=!0,o=n}finally{try{i||null==r.return||r.return()}finally{if(u)throw o}}return l}}(n,t)||l(n,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(n,t){if(n){if("string"==typeof n)return i(n,t);var r=Object.prototype.toString.call(n).slice(8,-1);return"Object"===r&&n.constructor&&(r=n.constructor.name),"Map"===r||"Set"===r?Array.from(n):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?i(n,t):void 0}}function i(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=new Array(t);r<t;r++)e[r]=n[r];return e}function u(n,t){return Object.prototype.hasOwnProperty.call(n,t)}function a(n){return"string"==typeof n||n instanceof String}function f(n){return"number"==typeof n||n instanceof Number}function c(n){return n instanceof Function}function s(n){return n instanceof Array}function h(n){return null==n}var v=null,p=-1;function y(n){this.current=n}function m(n,t,r,e){this.t=n,this.o=t,this.u=r,this.l=e,this.i=[],this.h=null,this.p=[],this.m="",this.v=null,this.M=null,this.g=null,this.j=null}function d(n,t){n.g=t,n.l instanceof y&&(n.l.current=t)}function g(n){if(n instanceof m)return n;if(a(n)||f(n)){var t=new m("#",{},null,null);return t.M=n,t}if(s(n)){for(var r=new m("[",{},null,null),e=-1,o=0;o<n.length;o++){var l=g(n[o]);null!==l&&b(r,l,++e)}return r}return null}function b(n,t,r){t.h=n,t.v=r,n.p[r]=t}var w=0,A=0;function S(n){return u(n,"hook_cid")?n.hook_cid:n.hook_cid="~"+(++A).toString(36)}function j(n){return u(n,"hook_alias")?n.hook_alias:n.hook_alias="{"+(++w).toString(36)}function O(n,t){n.hook_vnode=t}var k=new Map;function N(n,t,r){for(var e in r)u(r,e)&&h(t[e])&&E(n,e,r[e]);for(var o in t)u(t,o)&&I(n,o,t[o],r[o])}function E(n,t,r){var e=o(M(t,r),2),l=e[0];h(e[1])||n.removeAttribute(l)}function I(n,t,r,e){var l=o(M(t,r),2),i=l[0],c=l[1];if(!h(c))if("style"!==i){if((a(c)||f(c))&&n.setAttribute(i,c),i in n)try{n[i]=c}catch(n){}}else{if(!h(e)){var s=o(M(t,e),2)[1];if(!h(s))for(var v in s)u(s,v)&&!u(c,v)&&(n.style[v]="")}for(var p in c)u(c,p)&&(h(c[p])||(n.style[p]=c[p]))}}function M(n,t){return c(t)?[n.toLowerCase(),t]:"className"===n?s(t)?["class",t.filter((function(n){return a(n)})).join(" ")]:["class",t]:"class"===n?(console.error("className instead of class"),[n]):"style"!==n||h(t)||function(n){return!!n&&n.constructor===Object}(t)?[n,t]:(console.error("Style must be a plain object",t),[n])}function C(n){"svg"===n.t?n.j=1:null!==n.h?n.j=n.h.j:n.j=0;var t,r=null;if("#"===n.t)t=n.M,r=document.createTextNode(t);else if("="===n.t||"["===n.t);else if(a(n.t)){var e=null;1===n.j&&(e="http://www.w3.org/2000/svg"),r=function(n,t,r){var e=null!==n?document.createElementNS(n,t):document.createElement(t);return N(e,r,{}),e}(e,n.t,n.o),O(r,n)}d(n,r);for(var o=0;o<n.p.length;o++)C(n.p[o])}function x(n,t){for(var r=t&&L(t)[0]||null,e=0;e<n.length;e++){var o=n[e];if(null!==o.g){var l=_(o);null!==l&&(null!==r&&l===r.parentNode?l.insertBefore(o.g,r):l.appendChild(o.g))}}}function _(n){return null===n.h?null:null===n.h.g?_(n.h):n.h.g}function L(n){if(null!==n.g)return[n.g];for(var t=[],r=0;r<n.p.length;r++){var e=n.p[r];t.push.apply(t,function(n){if(Array.isArray(n))return i(n)}(o=L(e))||function(n){if("undefined"!=typeof Symbol&&null!=n[Symbol.iterator]||null!=n["@@iterator"])return Array.from(n)}(o)||l(o)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())}var o;return t}function T(n,t,r){this.k=D,this._=n,this.C=t,this.N=null,this.O=r}var D=0;function P(n){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];null===n.O||t?null!==n.N&&n.N():n.O()}function U(n,t){var r=o(t?[new Map,new Map]:W(n),2),e=r[0],l=r[1];V(n);var i=o(W(n),2),u=i[0],a=i[1];!function(n,t){n.forEach((function(n,r){var e,o=!t.has(r);!function(n,t){for(var r=0;r<n.i.length;r++){var e=n.i[r];e instanceof T&&(null!==e.O||null!==e.N)&&(t||1===e.k||4===e.k)&&P(e,t)}}(n,o),o&&(e=n.m,k.delete(e))}))}(l,a),C(n),function(n,t){!function(n,t){var r="";n.forEach((function(n,e){if(t.has(e)){var o=t.get(e);d(o,n.g),"#"===o.t?o.M!==n.M&&(l=o.g,i=o.M,l.textContent=i):N(o.g,o.o,n.o)}else e.startsWith(r+"/")||(function(n){for(var t=L(n),r=0;r<t.length;r++){var e=t[r];null!==e.parentNode&&e.parentNode.removeChild(e)}}(n),r=e);var l,i}))}(n,t),function(n,t){var r=[];t.forEach((function(t,e){n.has(e)?(x(r,n.get(e)),r.length=0):r.push(t)})),r.length>0&&x(r,null)}(n,t)}(e,u),function(n,t){t.forEach((function(t,r){!function(n,t){for(var r=0;r<n.i.length;r++){var e=n.i[r];e instanceof T&&(t||1===e.k||4===e.k)&&((o=e).N=o._())}var o}(t,!n.has(r))}))}(l,a)}function V(n){if("#"!==n.t)if(c(n.t)){v=n,p=-1;var t=g(n.t(n.o));v=null,p=-1,null!==t&&(b(n,t,0),$(n),V(t))}else for(var r=0;r<n.p.length;r++)V(n.p[r])}function W(n){var t=new Map,r=new Map;return B(n,r,t),[t,r]}function B(n,t,r){c(n.t)?t.set(n.m,n):"["!==n.t&&"="!==n.t&&r.set(n.m,n);for(var e=0;e<n.p.length;e++)B(n.p[e],t,r)}function J(n,t){var r=this;this.S=n,this.A=t,this.D=function(n){var t;(t=c(n)?n(r.A):n)!==r.A&&(r.A=t,U(r.S,!1))}}function $(n){for(var t=0;t<n.p.length;t++)F(n.p[t],n.m)}function F(n,t){var r,e;if(n.m=t+"/"+(null!==n.u?(r=n.u,"@"+encodeURIComponent(r)):n.v)+"/"+(c(n.t)?j(n.t):n.t),c(n.t)){var o=(e=n.m,k.get(e)||null);if(null!==o){n.i=o;for(var l=0;l<n.i.length;l++){var i=n.i[l];i instanceof J&&(i.S=n)}}!function(n,t){k.set(n,t)}(n.m,n.i)}for(var u=0;u<n.p.length;u++)F(n.p[u],n.m)}t.h=function(n,t){for(var o=t||{},l=o.key,i=void 0===l?null:l,u=o.ref,a=void 0===u?null:u,f=e(o,r),s=arguments.length,h=new Array(s>2?s-2:0),v=2;v<s;v++)h[v-2]=arguments[v];if(c(n))return f.children=h,new m(n,f,i,a);for(var p=new m(n,f,i,a),y=-1,d=0;d<h.length;d++){var w=g(h[d]);null!==w&&b(p,w,++y)}return p},t.LI=function(n,t){if(t.firstChild)throw new Error("Container must be empty");var r=g(n),e=new m(t.nodeName.toLowerCase(),{},null,null);e.m=S(t),e.j=t.ownerSVGElement?1:0,d(e,t),O(t,e),b(e,r,0),$(e),U(r,!0)},t.eJ=function(n){var t=o(function(){if(null===v)throw new Error("Cannot call hooks from outside of the component");return[v,++p]}(),2),r=t[0],e=t[1];if(r.i.length>e){var l=r.i[e];return[l.A,l.D]}var i=new J(r,n);return r.i.push(i),[i.A,i.D]}}},t={};function r(e){var o=t[e];if(void 0!==o)return o.exports;var l=t[e]={exports:{}};return n[e](l,l.exports,r),l.exports}(()=>{var n=r(112);function t(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=new Array(t);r<t;r++)e[r]=n[r];return e}function e(t){var r=t.children;return(0,n.h)("span",{className:"Wrapper"},r)}function o(t){var r=t.value,e=t.setValue;return(0,n.h)("input",{value:r,onInput:function(n){return e(n.target.value)}})}(0,n.LI)((0,n.h)((function(){var r,l,i=(r=(0,n.eJ)(""),l=2,function(n){if(Array.isArray(n))return n}(r)||function(n,t){var r=null==n?null:"undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(null!=r){var e,o,l=[],i=!0,u=!1;try{for(r=r.call(n);!(i=(e=r.next()).done)&&(l.push(e.value),!t||l.length!==t);i=!0);}catch(n){u=!0,o=n}finally{try{i||null==r.return||r.return()}finally{if(u)throw o}}return l}}(r,l)||function(n,r){if(n){if("string"==typeof n)return t(n,r);var e=Object.prototype.toString.call(n).slice(8,-1);return"Object"===e&&n.constructor&&(e=n.constructor.name),"Map"===e||"Set"===e?Array.from(n):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?t(n,r):void 0}}(r,l)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),u=i[0],a=i[1],f=function(){switch(u){case"1":return{color:"red"};case"2":return{fontWeight:"bold"};case"3":return{color:"red",fontStyle:"italic"}}return null}();return(0,n.h)("main",null,(0,n.h)("div",{key:"haha"},(0,n.h)(e,null,(0,n.h)(o,{value:u,setValue:a}),(0,n.h)("div",{style:f},"Hello world!"))))}),null),document.getElementById("sandbox-container"))})()})();