"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const l=l=>"string"==typeof l,n=l=>"number"==typeof l,t=l=>"function"==typeof l;let u=null,e=null;const i=(l,n)=>{if(null===u)throw new Error("Cannot call hooks from outside of the component");if(null===e)null===u.l?(e=l(u),u.l=e):e=u.l;else if(null===e.t){const n=e;e=l(u),n.t=e}else e=e.t;return n(e)};function s(l){this.current=l,this.t=null}function o(l,n,t=null,u=null){this.u=l,this.i=t,this.o=null,this.h=l===r?null:void 0!==n?n:{},this.l=null,this.p=null,this.m=null,this.v=u,this.g=null,this.M=null,this.j=null,this.O=null,this.T=null,this.k=null}const r="[",f=l=>l.children,c=()=>{},h=(l,n)=>{l.p=n,l.v instanceof s&&(l.v.current=n)},a=t=>{let u=null;return t instanceof o?u=t:l(t)||n(t)?u=new o("#",t):t instanceof Array&&(u=new o(r),p(u,t)),u},p=(l,n)=>{for(let t,u=null,e=0,i=n.length;e<i;++e)t=a(n[e]),null!==t&&(t.g=l,t.o=e,null!==u?u.j=t:l.M=t,u=t)},w=(l,n)=>{l.hook_vnode=n},d=(l,n,t)=>{b(l,n,t,m,v)},m=(t,u,e,i)=>{if(""!==(u=y(u)))if("style"!==u){if(l(e)||n(e))t.setAttribute(u,e);else if(u in t)try{t[u]=e}catch(l){0}}else x(t.style,e,i||{})},v=(t,u,e)=>{if(""!==(u=y(u)))if(l(e)||n(e))t.removeAttribute(u);else if(u in t)try{t[u]=null}catch(l){0}},y=l=>"class"===l?"":"className"===l?"class":/^on[A-Z]/.test(l)?l.toLowerCase():l,x=(l,n,t)=>{b(l,n,t,g,M)},g=(l,n,t)=>{l[n]=t},M=(l,n)=>{l[n]=""},b=(l,n,t,u,e)=>{let i;for(i in t)j(t,i)&&(j(n,i)||e(l,i,t[i]));for(i in n)j(n,i)&&u(l,i,n[i],t[i])},j=(l,n)=>{return t=l,u=n,Object.prototype.hasOwnProperty.call(t,u)&&!(null==l[n]);var t,u},O=l=>{return"#"===l.u?(n=l.h,document.createTextNode(n)):((l,n,t)=>{const u=1===l?document.createElementNS("http://www.w3.org/2000/svg",n):document.createElement(n);return d(u,t,{}),u})(l.m,l.u,l.h);var n},T=l=>"svg"===l.u?1:1===l.g.m&&"foreignObject"===l.g.u?0:l.g.m,k=l=>l===r||t(l),A=(l,n)=>{if(((l,n)=>{var t,u;l.m=T(l),k(l.u)||(h(l,n.p),"#"===l.u?l.h!==n.h&&(t=l.p,u=l.h,t.textContent=u):d(l.p,l.h,n.h))})(l,n),null!==l.p){const n=P(l);null!==n&&(n.k=l.p)}},E=l=>{if((l=>{if(l.m=T(l),k(l.u))return;const n=O(l);h(l,n)})(l),null!==l.p){const n=P(l);if(null!==n){const t=null!==n.k?n.k.nextSibling:n.p.firstChild;n.p.insertBefore(l.p,t),n.k=l.p}}},P=l=>{let n=l.g;for(;;){if(null===n)return null;if(null!==n.p)return n;n=n.g}},_=(l,n)=>{let t=l,u=l;for(;;){if(null!==u.p)n(u.p);else if(null!==u.M){u=u.M;continue}if(u===t)return;for(;null===u.j;){if(null===u.g||u.g===t)return;u=u.g}u=u.j}};function C(l,n,t){this.A=l,this.P=n,this._=t,this.C=null,this.G=null,this.t=null}const G=l=>{l.C=l.A(),void 0===l.C&&(l.C=null)},N=(l,n)=>{null===l.G||n?null!==l.C&&l.C():l.G()},S=(l,n)=>null===l?0:0===l.length?1:null===n||((l,n)=>{if(l.length!==n.length)return!1;for(let t=l.length-1;t>=0;--t)if(l[t]!==n[t])return!1;return!0})(l,n)?2:3;let V=null;const Z=new Map,q=()=>{Z.forEach(((l,n)=>{let u,e,i=0;for(;l.length>0;){let n;[u,e]=l.pop(),n=t(u)?u(e.N):u,n!==e.N&&(e.N=n,i=1)}i&&L(n)})),Z.clear(),V=null};function z(l,n){this.S=l,this.N=n,this.V=l=>{let n=Z.get(this.S);void 0===n?(n=[[l,this]],Z.set(this.S,n)):n.push([l,this]),null!==V&&clearTimeout(V),V=setTimeout(q)},this.t=null}const B=l=>{const n=null!==l.O?l.O.M:l.M;u=l;const t=a(l.u(l.h));u=null,e=null,l.M=t,null!==t&&(t.g=l),null===t&&null!==n?H(l,n):null!==t&&null!==n&&(t.u===n.u&&t.i===n.i?F(t,n):H(l,n))},D=l=>{if(null===l.O)return;const n=I(l.O),t=I(l);let u;n.forEach(((n,e)=>{u=t.get(e),void 0!==u&&u.u===n.u?F(u,n):H(l,n)}))},F=(l,n)=>{if(l.O=n,t(l.u)){l.l=n.l;let t=l.l;for(;null!==t;)t instanceof z&&(t.S=l),t=t.t}},H=(l,n)=>{null===l.T?l.T=[n]:l.T.push(n)},I=l=>{const n=new Map;let t=l.M;for(;null!==t;)null!==t.i?n.set(t.i,t):n.set(t.o,t),t=t.j;return n},J=(l,n,t,...u)=>{let e=t;for(;;)if(l(e,t,...u),null===e.M){if(e===t)return;for(;null===e.j;){if(null===e.g||e.g===t)return;e=e.g,null!==n&&n(e)}e=e.j}else e=e.M},K=l=>{"undefined"!=typeof Promise?Promise.resolve().then(l):setTimeout(l)},L=l=>{const n=new Map,t=new Map;J(Q,R,l,n,t),K((()=>{t.forEach(((l,n)=>{((l,n)=>{let t=l.l;for(;null!==t;)t instanceof C&&(null===t.G&&null===t.C||(n||0===t._||3===t._)&&N(t,n)),t=t.t})(n,l)})),n.forEach(((l,n)=>{((l,n)=>{let t=l.l;for(;null!==t;)t instanceof C&&(n||0===t._||3===t._)&&G(t),t=t.t})(n,l)}))}))},Q=(l,n,u,e)=>{(l=>{t(l.u)?B(l):D(l)})(l),l.u!==f&&(l===n?null!==l.l&&(e.set(l,!1),u.set(l,!1)):null!==l.O?(A(l,l.O),null!==l.l&&(e.set(l.O,!1),u.set(l,!1)),l.O=null):(E(l),null!==l.l&&u.set(l,!0)),null!==l.T&&(l.T.forEach((l=>{K((()=>{J((l=>{null!==l.l&&e.set(l,!0)}),null,l)})),(l=>{_(l,(l=>{null!==l.parentNode&&l.parentNode.removeChild(l)}))})(l)})),l.T=null))},R=l=>{null!==l.k&&(l.k=null)},U=(l,n)=>{let t;return(t=n.hook_vnode)||(t=new o(f),t.m="ownerSVGElement"in n?1:0,h(t,n),w(n,t)),t.h.children=l,t};exports.Fragment=c,exports.createPortal=U,exports.h=(l,n,...u)=>{const{key:e,ref:i,...s}=n||{};l===c&&(l=r);const f=new o(l,s,e,i);return t(l)?u.length>0&&(f.h.children=u.length>1?u:u[0]):p(f,u),f},exports.mount=(l,n)=>{const t=U(l,n);L(t)},exports.useEffect=(l,n=null)=>i((t=>{const u=S(n,null);return new C(l,n,u)}),(t=>{const u=S(n,t.P);if(1!==u){if(2!==u)return 0===u||3===u?(t.A=l,t.P=n,t._=u,t.G=t.C,void(t.C=null)):void 0;t._=u}})),exports.useRef=l=>i((n=>new s(l)),(l=>l)),exports.useState=l=>i((n=>new z(n,l)),(l=>[l.N,l.V]));
