Object.defineProperty(exports,"__esModule",{value:1});let n=null,t=null,u=null,l=null;function i(t,l){return r(),u=o(t,u,n.t),null===n.t&&(n.t=u),l(u)}function o(t,u,l){if(null===u)return null===l?t(n):l;if(null===u.u){const l=t(n);return u.u=l,l}return u.u}function r(){if(null===n)throw new Error("Cannot use hooks from outside of components")}function e(n){this.current=n}function f(n){this.l=new e(n),this.u=null}const c=Object.prototype.hasOwnProperty,s=Array.prototype.slice;function h(n){return"string"==typeof n}function a(n){return"number"==typeof n}function p(n){return"function"==typeof n}function w(n){return null==n}function v(n){return n.children}function d(n,t){this.i=n,this.o=null,this.h=null,this.p=t,this.v=null,this.t=null,this.m=null,this.g=null,this.M=null,this.l=null,this.T=null,this.A=null,this.j=null,this.C=null,this.O=null,this._=null}function x(n,t){n.g=t,null!==n.l&&(n.l.current=t)}const m={};function y(n,t,u){let l=null,i=null;const o=p(n);null===t?o&&(t=m):(void 0!==t.key&&(l=a(t.key)?""+t.key:t.key,delete t.key),void 0!==t.ref&&(t.ref instanceof e?o||(i=t.ref,delete t.ref):delete t.ref));const r=new d(n,t);if(r.o=l,r.l=i,arguments.length>2){const t=arguments.length>3;t&&(u=s.call(arguments,2)),o?r.p===m?r.p={children:u}:r.p.children=u:"#"===n?r.p=""+u:t?M(r,u):T(r,u)}return r}function g(n){if(n instanceof d)return n;if(h(n))return new d("#",n);if(a(n))return new d("#",""+n);if(n instanceof Array){const t=new d("[",null);return M(t,n),t}return null}function M(n,t){let u,l=null,i=0;for(;i<t.length;++i)u=g(t[i]),null!==u&&(u.T=n,u.h=i,null!==l?l.j=u:n.A=u,l=u)}function T(n,t){const u=g(t);null!==u&&(n.A=u,u.T=n)}function b(n,t){n["%vnode"]=t}function A(n){for(;;){if(null===n)return null;if(null!==n.g)return n;n=n.T}}function j(n,t,u){let l=t.A;if(null!==l)for(;;){if(l===u)return;if(null!==l.g)n(l.g);else if(null!==l.A){l=l.A;continue}if(l===t)return;for(;null===l.j;){if(null===l.T||l.T===t)return;l=l.T}l=l.j}}function C(n,t,u){N(n,t,u,E,O)}function E(n,t,u,l){if(""!==(t=k(t)))if("style"!==t){if(G(t,u)&&n.setAttribute(t,u),t in n)try{return void(n[t]=u)}catch(n){}}else H(n[t],u,l)}function O(n,t,u){if(""!==(t=k(t))){if("style"===t)return H(n[t],null,u),void n.removeAttribute(t);if(G(t,u)&&n.removeAttribute(t),t in n)try{n[t]=null}catch(n){}}}const _=/^on[A-Z]/;function k(n){return"className"===n?"class":_.test(n)?n.toLowerCase():n}function G(n,t){return"innerHTML"===n||"innerText"===n||"textContent"===n?0:h(t)||a(t)?1:0}function H(n,t,u){N(n,t,u,I,L)}function I(n,t,u){n[t]=u}function L(n,t){n[t]=""}function N(n,t,u,l,i){const o=w(u),r=w(t);let e;if(o)if(r);else for(e in t)S(t,e)&&l(n,e,t[e]);else if(r)for(e in u)S(u,e)&&i(n,e,u[e]);else{for(e in u)S(u,e)&&(S(t,e)||i(n,e,u[e]));for(e in t)S(t,e)&&l(n,e,t[e],u[e])}}function S(n,t){return c.call(n,t)&&!w(n[t])}function V(n){null!==n.parentNode&&n.parentNode.removeChild(n)}function Z(n){if(n.M=q(n),z(n.i))return;let t;var u;"#"===n.i?(u=n.p,t=document.createTextNode(u),n.p=null):t=function(n,t,u){const l=1===n?document.createElementNS("http://www.w3.org/2000/svg",t):document.createElement(t);return C(l,u),l}(n.M,n.i,n.p),x(n,t)}function q(n){return"svg"===n.i?1:1===n.T.M&&"foreignObject"===n.T.i?0:n.T.M}function z(n){return"["===n||p(n)}function B(n,t){if(function(n,t){var u,l;n.M=q(n),z(n.i)||(x(n,t.g),"#"===n.i?(u=n.g,l=n.p,u.textContent!==l&&(u.textContent=l),n.p=null):C(n.g,n.p,t.p))}(n,t),null!==n.g){const t=A(n.T);null!==t&&(t._=n.g)}}function D(n,t,u){this.k=n,this.G=t,this.H=K.bind(this),this.I=u,this.u=null}const F=new Map;let J=null;function K(n){let t;if(p(n))try{t=n(this.G)}catch(n){return void R(n,this.I)}else t=n;(1!==this.k||Q(t))&&this.G!==t&&(this.G=t,F.set(this.I,this),null!==J&&clearTimeout(J),J=setTimeout(P))}function P(){J=null;const n=[];F.forEach((function(t){n.push(t.I)})),F.clear();for(let t=0;t<n.length;++t)cn(n[t])}function Q(n){return null===n||n instanceof Error?1:0}function R(n,t){let u,l=t.T;for(;null!==l;){for(u=l.t;null!==u;){if(1===u.k)return void u.H((function(t){return t||n}));u=u.u}l=l.T}throw n}function U(n,t,u){this.k=n,this.L=t,this.N=u,this.S=null,this.V=null,this.Z=null,this.u=null}function W(t,u,i){return void 0===i&&(i=null),e=function(){return new U(t,u,i)},f=function(n){n.L=u,n.N=i},r(),l=o(e,l,n.m),null===n.m&&(n.m=l),f(l);var e,f}function X(n,t,u){let l=t.m;for(;null!==l;){if(l.k===n&&(u||tn(l.N,l.V)))try{$(l)}catch(n){R(n,t)}l=l.u}}function Y(n,t,u){let l=t.m;for(;null!==l;){if(l.k===n&&(null!==l.Z||null!==l.S)&&(u||tn(l.N,l.V)))try{nn(l,u)}catch(n){R(n,t)}l=l.u}}function $(n){n.V=n.N,n.Z=n.S,n.S=n.L(),void 0===n.S&&(n.S=null)}function nn(n,t){null===n.Z||t?null!==n.S&&n.S():n.Z()}function tn(n,t){return null===n?1:0===n.length||null===t||function(n,t){if(n.length!==t.length)return 0;for(let u=n.length-1;u>=0;--u)if(n[u]!==t[u])return 0;return 1}(n,t)?0:1}function un(i,o){p(i.i)?function(i,o,r){if(null!==o){i.v=o.v,i.t=o.t,i.m=o.m;let n=i.t;for(;null!==n;)n.I=i,n=n.u}let e;f=i,n=f;var f;try{e=i.i(i.p)}catch(n){R(n,i),e=null}n=null,t=null,u=null,l=null;const c=g(e);null!==c&&(c.T=i);const s=r?i.A:null!==o?o.A:null;null!==s&&(null!==c&&c.i===s.i&&c.o===s.o?ln(c,s):on(i,s));i.A=c}(i,i.C,o):null!==i.C&&function(n,t){const u=rn(t),l=rn(n);let i;u.forEach((function(t,u){i=l.get(u),void 0!==i&&i.i===t.i?ln(i,t):on(n,t)}))}(i,i.C)}function ln(n,t){n.C=t}function on(n,t){null===n.O?n.O=[t]:n.O.push(t)}function rn(n){const t=new Map;let u=n.A;for(;null!==u;)null!==u.o?t.set(u.o,u):t.set(u.h,u),u=u.j;return t}const en="Apple Computer, Inc."===navigator.vendor,fn=en?document.createDocumentFragment():null;function cn(n){const t=new Map,u=new Map,l=A(n);if(j((function(n){l._=n}),l,n),en){const i=l.g;for(l.g=fn;null!==i.firstChild;)fn.appendChild(i.firstChild);an(sn,hn,n,t,u),i.appendChild(fn),l.g=i}else an(sn,hn,n,t,u);l._=null,u.forEach((function(n,t){Y(1,t,n)})),t.forEach((function(n,t){X(1,t,n)})),setTimeout((function(){u.forEach((function(n,t){Y(0,t,n)})),t.forEach((function(n,t){X(0,t,n)}))}))}function sn(n,t,u,l){const i=n===t;if(un(n,i),n.i!==v&&(i?null!==n.m&&(l.set(n,0),u.set(n,0)):null!==n.C?(B(n,n.C),null!==n.m&&(l.set(n.C,0),u.set(n,0)),n.C=null):(!function(n){if(Z(n),null!==n.g){const i=A(n.T);null!==i&&(t=i.g,u=n.g,l=i._,t.insertBefore(u,null!==l?l.nextSibling:t.firstChild),i._=n.g)}var t,u,l}(n),null!==n.m&&u.set(n,1))),null!==n.O){for(let t=0;t<n.O.length;++t)null!==(o=n.O[t]).g?V(o.g):j(V,o),an((function(n){null!==n.m&&l.set(n,1)}),null,n.O[t]);n.O=null}var o}function hn(n){n._=null}function an(n,t,u,l,i){let o=u;for(;;)if(n(o,u,l,i),null===o.A){if(o===u)return;for(;null===o.j;){if(null===o.T||o.T===u)return;o=o.T,null!==t&&t(o)}o=o.j}else o=o.A}function pn(n,t){let u;return(u=t["%vnode"])||(u=new d(v,{}),u.M="ownerSVGElement"in t?1:0,x(u,t),b(t,u)),u.p.children=n,u}exports.Fragment="[",exports.Ref=e,exports.TextNode="#",exports.createElement=y,exports.createPortal=pn,exports.jsx=y,exports.render=function(n,t){cn(pn(n,t))},exports.useEffect=function(n,t){return W(0,n,t)},exports.useError=function(n){return i((function(t){return Q(n)||(n=null),new D(1,n,t)}),(function(n){return[n.G,n.H]}))},exports.useLayoutEffect=function(n,t){return W(1,n,t)},exports.useRef=function(u){return l=function(){return new f(u)},i=function(n){return n.l},r(),t=o(l,t,n.v),null===n.v&&(n.v=t),i(t);var l,i},exports.useState=function(n){return i((function(t){return new D(0,n,t)}),(function(n){return[n.G,n.H]}))};
