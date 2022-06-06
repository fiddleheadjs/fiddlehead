Object.defineProperty(exports,"__esModule",{value:1});let n=null,t=null,u=null,l=null;function i(t,l){return r(),u=o(t,u,n.t),null===n.t&&(n.t=u),l(u)}function o(t,u,l){if(null===u)return null===l?t(n):l;if(null===u.u){const l=t(n);return u.u=l,l}return u.u}function r(){if(null===n)throw new Error("Cannot use hooks from outside of components")}function e(n){this.current=n}function f(n){this.l=new e(n),this.u=null}const c=Object.prototype.hasOwnProperty,s=Array.prototype.slice;function h(n){return"string"==typeof n}function a(n){return"number"==typeof n}function p(n){return"function"==typeof n}function w(n){return null!==n&&"object"==typeof n}function d(n){return n.children}function v(n,t,u){this.i=n,this.o=u,this.h=null,this.p=t,this.v=null,this.t=null,this.m=null,this.g=null,this.M=null,this.j=null,this.A=null,this.O=null,this.T=null,this._=null,this.k=null}function y(n,t){n.g=t,void 0!==n.p.ref&&(n.p.ref.current=t)}const m={};function x(n,t,u){let l=null;null===t?t=m:(void 0!==t.key&&(l=a(t.key)?""+t.key:t.key,delete t.key),void 0===t.ref||t.ref instanceof e||delete t.ref);const i=new v(n,t,l);if(arguments.length>2){const t=arguments.length>3;if(t&&(u=s.call(arguments,2)),p(n))i.p===m&&(i.p={}),i.p.children=u;else if("#"===n)if(i.p===m&&(i.p={}),t){let n="",t=0;for(;t<u.length;++t)n+=b(u[t]);i.p.children=n}else i.p.children=b(u);else M(i,t?u:[u])}return i}function g(n){if(n instanceof v)return n;if(h(n))return new v("#",{children:n},null);if(a(n))return new v("#",{children:""+n},null);if(n instanceof Array){const t=new v("[",m,null);return M(t,n),t}return null}function b(n){return h(n)?n:a(n)?""+n:""}function M(n,t){let u,l=null,i=0;for(;i<t.length;++i)u=g(t[i]),null!==u&&(u.j=n,u.h=i,null!==l?l.O=u:n.A=u,l=u)}function j(n,t){n["%vnode"]=t}function A(n){for(;;){if(null===n)return null;if(null!==n.g)return n;n=n.j}}function E(n,t,u){F(n,t,u,O,T)}function O(n,t,u,l){if(""!==(t=_(t))){if("style"===t)return w(u)||(u={}),w(l)||(l={}),void k(n[t],u,l);if(h(u)||a(u))n.setAttribute(t,u);else if(t in n)try{n[t]=u}catch(n){0}}}function T(n,t,u){if(""!==(t=_(t))){if("style"===t)return w(u)||(u={}),k(n[t],{},u),void n.removeAttribute(t);if(h(u)||a(u))n.removeAttribute(t);else if(t in n)try{n[t]=null}catch(n){0}}}function _(n){return"class"===n?"":"className"===n?"class":/^on[A-Z]/.test(n)?n.toLowerCase():n}function k(n,t,u){F(n,t,u,C,D)}function C(n,t,u){n[t]=u}function D(n,t){n[t]=""}function F(n,t,u,l,i){let o;for(o in u)G(u,o)&&(G(t,o)||i(n,o,u[o]));for(o in t)G(t,o)&&l(n,o,t[o],u[o])}function G(n,t){return c.call(n,t)&&void 0!==n[t]&&null!==n[t]}function N(n){if(n.M=S(n),V(n.i))return;const t=function(n){if("#"===n.i)return t=n.p.children,document.createTextNode(t);var t;return function(n,t,u){const l=1===n?document.createElementNS("http://www.w3.org/2000/svg",t):document.createElement(t);return E(l,u,{}),l}(n.M,n.i,n.p)}(n);y(n,t)}function S(n){return"svg"===n.i?1:1===n.j.M&&"foreignObject"===n.j.i?0:n.j.M}function V(n){return"["===n||p(n)}function Z(n,t){if(function(n,t){var u,l;n.M=S(n),V(n.i)||(y(n,t.g),"#"===n.i?n.p.children!==t.p.children&&(u=n.g,l=n.p.children,u.textContent=l):E(n.g,n.p,t.p))}(n,t),null!==n.g){const t=A(n.j);null!==t&&(t.k=n.g)}}function q(n,t,u){this.C=n,this.D=t,this.F=H.bind(this),this.G=u,this.u=null}const z=new Map;let B=null;function H(n){let t=z.get(this.C);void 0===t?(t=[[n,this]],z.set(this.C,t)):t.unshift([n,this]),null!==B&&clearTimeout(B),B=setTimeout(I)}function I(){z.forEach((function(n){let t,u,l,i,o=0;for(;n.length>0;){if(t=n.pop(),u=t[0],l=t[1],p(u))try{i=u(l.D)}catch(n){K(n,l.C);continue}else i=u;(1!==l.G||J(i))&&(i!==l.D&&(l.D=i,o=1))}o&&on(l.C)})),z.clear(),B=null}function J(n){return null===n||n instanceof Error?1:0}function K(n,t){let u,l=t.j;for(;null!==l;){for(u=l.t;null!==u;){if(1===u.G)return void u.F((function(t){return t||n}));u=u.u}l=l.j}throw n}function L(n,t,u,l){this.N=n,this.S=t,this.G=u,this.V=l,this.Z=null,this.q=null,this.u=null}function P(t,u,i){return void 0===u&&(u=null),e=function(){const n=X(u,null);return new L(t,u,i,n)},f=function(n){const l=X(u,n.S);if(1!==l){if(2!==l)return 0===l||3===l?(n.N=t,n.S=u,n.V=l,n.q=n.Z,void(n.Z=null)):void 0;n.V=l}},r(),l=o(e,l,n.m),null===n.m&&(n.m=l),f(l);var e,f}function Q(n,t,u){let l=t.m;for(;null!==l;){if(l.G===n&&(u||0===l.V||3===l.V))try{U(l)}catch(n){K(n,t)}l=l.u}}function R(n,t,u){let l=t.m;for(;null!==l;){if(l.G===n&&(null!==l.q||null!==l.Z)&&(u||0===l.V||3===l.V))try{W(l,u)}catch(n){K(n,t)}l=l.u}}function U(n){n.Z=n.N(),void 0===n.Z&&(n.Z=null)}function W(n,t){null===n.q||t?null!==n.Z&&n.Z():n.q()}function X(n,t){return null===n?0:0===n.length?1:null===t||function(n,t){if(n.length!==t.length)return 0;for(let u=n.length-1;u>=0;--u)if(n[u]!==t[u])return 0;return 1}(n,t)?2:3}function Y(i,o){p(i.i)?function(i,o){const r=o?i.A:null!==i.T?i.T.A:null;let e;f=i,n=f;var f;try{e=i.i(i.p)}catch(n){K(n,i),e=null}n=null,t=null,u=null,l=null;const c=g(e);null!==c&&(c.j=i);null!==r&&(null!==c&&c.i===r.i&&c.o===r.o?$(c,r):nn(i,r));i.A=c}(i,o):null!==i.T&&function(n,t){const u=tn(t),l=tn(n);let i;u.forEach((function(t,u){i=l.get(u),void 0!==i&&i.i===t.i?$(i,t):nn(n,t)}))}(i,i.T)}function $(n,t){if(n.T=t,p(n.i)){n.v=t.v,n.t=t.t,n.m=t.m;let u=n.t;for(;null!==u;)u.C=n,u=u.u}}function nn(n,t){null===n._?n._=[t]:n._.push(t)}function tn(n){const t=new Map;let u=n.A;for(;null!==u;)null!==u.o?t.set(u.o,u):t.set(u.h,u),u=u.O;return t}function un(n,t,u,l,i){let o=u;for(;;)if(n(o,u,l,i),null===o.A){if(o===u)return;for(;null===o.O;){if(null===o.j||o.j===u)return;o=o.j,null!==t&&t(o)}o=o.O}else o=o.A}const ln=new DocumentFragment;function on(n){const t=new Map,u=new Map,l=A(n),i=l.g;l.g=ln,un(rn,en,n,t,u),i.appendChild(ln),l.g=i,u.forEach((function(n,t){R(1,t,n)})),t.forEach((function(n,t){Q(1,t,n)})),setTimeout((function(){u.forEach((function(n,t){R(0,t,n)})),t.forEach((function(n,t){Q(0,t,n)}))}))}function rn(n,t,u,l){const i=n===t;if(Y(n,i),n.i!==d&&(i?null!==n.m&&(l.set(n,0),u.set(n,0)):null!==n.T?(Z(n,n.T),null!==n.m&&(l.set(n.T,0),u.set(n,0)),n.T=null):(!function(n){if(N(n),null!==n.g){const t=A(n.j);if(null!==t){const u=null!==t.k?t.k.nextSibling:t.g.firstChild;t.g.insertBefore(n.g,u),t.k=n.g}}}(n),null!==n.m&&u.set(n,1))),null!==n._){for(let t=0;t<n._.length;++t)(function(n,t){const u=n;for(;;){if(null!==n.g)t(n.g);else if(null!==n.A){n=n.A;continue}if(n===u)return;for(;null===n.O;){if(null===n.j||n.j===u)return;n=n.j}n=n.O}})(n._[t],(function(n){null!==n.parentNode&&n.parentNode.removeChild(n)})),un((function(n){null!==n.m&&l.set(n,1)}),null,n._[t]);n._=null}}function en(n){null!==n.k&&(n.k=null)}function fn(n,t){let u;return(u=t["%vnode"])||(u=new v(d,{},null),u.M="ownerSVGElement"in t?1:0,y(u,t),j(t,u)),u.p.children=n,u}exports.Fragment="[",exports.Ref=e,exports.TextNode="#",exports.createElement=x,exports.createPortal=fn,exports.jsx=x,exports.mount=function(n,t){on(fn(n,t))},exports.useEffect=function(n,t){return P(n,t,0)},exports.useError=function(n){return i((function(t){return J(n)||(n=null),new q(t,n,1)}),(function(n){return[n.D,n.F]}))},exports.useLayoutEffect=function(n,t){return P(n,t,1)},exports.useRef=function(u){return l=function(){return new f(u)},i=function(n){return n.l},r(),t=o(l,t,n.v),null===n.v&&(n.v=t),i(t);var l,i},exports.useState=function(n){return i((function(t){return new q(t,n,0)}),(function(n){return[n.D,n.F]}))};
