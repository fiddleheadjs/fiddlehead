"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const n=n=>"string"==typeof n,l=n=>"number"==typeof n,t=n=>"function"==typeof n;let u=null,e=-1;const r=()=>{if(null===u)throw new Error("Cannot call hooks from outside of the component");return[u,++e]};function s(n){this.current=n}function i(n,l={},u=null,e=null){this.l=n,this.t=u,this.u=null,this.i=null,this.o=null,this.h=null,this.p=null,this.v=null,this.m=null,this.g=null,this.j=null,this.M=e instanceof s?e:null,n!==o&&(this.O=l,t(n)&&(this.k=[]))}const o="[",c=n=>n.children,f=(n,l)=>{n.j=l,null!==n.M&&(n.M.current=l)},h=t=>{let u=null;return t instanceof i?u=t:n(t)||l(t)?u=new i("#",{children:t}):t instanceof Array&&(u=new i(o),a(u,t)),u},a=(n,l)=>{for(let t,u=null,e=0,r=l.length;e<r;++e)t=h(l[e]),null!==t&&(t.o=n,t.u=e,null!==u?u.p=t:n.h=t,t.v=u,u=t)},w=(n,l)=>{n.hook_vnode=l},d=(n,l,t)=>{b(n,l,t,p,v)},p=(t,u,e,r)=>{if(""!==(u=m(u)))if("style"!==u){if(n(e)||l(e))t.setAttribute(u,e);else if(u in t)try{t[u]=e}catch(n){0}}else y(t.style,e,r||{})},v=(t,u,e)=>{if(""!==(u=m(u)))if(n(e)||l(e))t.removeAttribute(u);else if(u in t)try{t[u]=null}catch(n){0}},m=n=>"class"===n?"":"className"===n?"class":/^on[A-Z]/.test(n)?n.toLowerCase():n,y=(n,l,t)=>{b(n,l,t,x,g)},x=(n,l,t)=>{n[l]=t},g=(n,l)=>{n[l]=""},b=(n,l,t,u,e)=>{let r;for(r in t)j(t,r)&&(j(l,r)||e(n,r,t[r]));for(r in l)j(l,r)&&u(n,r,l[r],t[r])},j=(n,l)=>{return t=n,u=l,Object.prototype.hasOwnProperty.call(t,u)&&!(null==n[l]);var t,u},M=n=>{return"#"===n.l?(l=n.O.children,document.createTextNode(l)):((n,l,t)=>{const u=1===n?document.createElementNS("http://www.w3.org/2000/svg",l):document.createElement(l);return d(u,t,{}),u})(n.i,n.l,n.O);var l},O=n=>"svg"===n.l?1:1===n.o.i&&"foreignObject"===n.o.l?0:n.o.i,k=(n,l)=>{((n,l)=>{var u,e;n.l!==c&&(n.i=O(n),n.l===o||t(n.l)||(f(n,l.j),"#"===n.l?n.O.children!==l.O.children&&(u=n.j,e=n.O.children,u.textContent=e):d(n.j,n.O,l.O)))})(n,l)},A=n=>{(n=>{if(n.l===c)return;if(n.i=O(n),n.l===o||t(n.l))return;const l=M(n);f(n,l)})(n);const l=E(n);null!==l&&n.j&&l.appendChild(n.j)},E=n=>n.l===c?n.j:null===n.o?null:null!==n.o.j?n.o.j:E(n.o),_=(n,l)=>{if(null!==n.j)return void l(n.j);let t=n.h;for(;null!==t;)_(t,l),t=t.p};function C(n,l,t){this.A=n,this._=l,this.C=null,this.G=t,this.N=null}const G=(n,l)=>{for(let t,u=0,e=n.k.length;u<e;++u)t=n.k[u],t instanceof C&&(null!==t.G||null!==t.C)&&(l||0===t.N||3===t.N)&&S(t,l)},N=n=>{n.C=n.A(),void 0===n.C&&(n.C=null)},S=(n,l)=>{null===n.G||l?null!==n.C&&n.C():n.G()},V=(n,l)=>null===n?0:0===n.length?1:null===l||((n,l)=>{for(let t=n.length-1;t>=0;--t)if(n[t]!==l[t])return!1;return!0})(n,l)?2:3;function Z(n,l){this.S=n,this.V=l,this.Z=n=>{let l;l=t(n)?n(this.V):n,l!==this.V&&(this.V=l,H(this.S))}}const q=n=>{const l=null!==n.m?n.m.h:n.h;u=n,e=-1;const t=h(n.l(n.O));u=null,e=-1,n.h=t,null!==t&&(t.o=n),null===t&&null!==l?D(n,l):null!==t&&null!==l&&(t.l===l.l&&t.t===l.t?B(t,l):D(n,l))},z=n=>{if(null===n.m)return;const l=F(n.m),t=F(n);let u;l.forEach(((l,e)=>{u=t.get(e),void 0!==u&&u.l===l.l?B(u,l):D(n,l)}))},B=(n,l)=>{if(n.m=l,t(n.l)){n.k=l.k;for(let l,t=0,u=n.k.length;t<u;++t)l=n.k[t],l instanceof Z&&(l.S=n)}},D=(n,l)=>{null===n.g?n.g=[l]:n.g.push(l)},F=n=>{const l=new Map;let t=n.h;for(;null!==t;)null!==t.t?l.set(t.t,t):l.set(t.u,t),t=t.p;return l},H=n=>{const l=new Map;K(I,J,l,n,n)},I=(n,l,u)=>{(n=>{t(n.l)?q(n):z(n)})(n),n===l?(G(n,!1),u.set(n,!1)):null!==n.m?(k(n,n.m),t(n.l)&&(G(n.m,!1),u.set(n,!1)),n.m=null):(A(n),t(n.l)&&u.set(n,!0)),null!==n.g&&(n.g.forEach((n=>{K((n=>{t(n.l)&&G(n,!0)}),null,null,n,n),(n=>{_(n,(n=>{null!==n.parentNode&&n.parentNode.removeChild(n)}))})(n)})),n.g=null)},J=n=>{n.forEach(((n,l)=>{((n,l)=>{for(let t,u=0,e=n.k.length;u<e;++u)t=n.k[u],t instanceof C&&(l||0===t.N||3===t.N)&&N(t)})(l,n)}))},K=(n,l,t,u,e,r=!1)=>{if(r){if(null!==e.p)return void K(n,l,t,u,e.p)}else{if(n(e,u,t),null!==e.h)return void K(n,l,t,u,e.h);if(null!==e.p)return void K(n,l,t,u,e.p)}e===u||e.o===u?null!==l&&l(t):K(n,l,t,u,e.o,!0)},L=(n,l)=>{let t;return(t=l.hook_vnode)||(t=new i(c),t.i="ownerSVGElement"in l?1:0,f(t,l),w(l,t)),t.O.children=n,t};exports.createPortal=L,exports.h=(n,l,...u)=>{const{key:e,ref:r,...s}=l||{},o=new i(n,s,e,r);return t(n)?u.length>0&&(o.O.children=u.length>1?u:u[0]):a(o,u),o},exports.mount=(n,l)=>{const t=L(n,l);H(t)},exports.useEffect=(n,l=null)=>{const[t,u]=r();if(t.k.length>u){const e=t.k[u];0;const r=V(l,e._);if(1===r)return;if(2===r)return void(e.N=r);if(0===r||3===r){const s=new C(n,l,e.C);return s.N=r,void(t.k[u]=s)}return}const e=new C(n,l,null);e.N=V(l,null),t.k.push(e)},exports.useRef=n=>{const[l,t]=r();if(l.k.length>t)return l.k[t];const u=new s(n);return l.k.push(u),u},exports.useState=n=>{const[l,t]=r();let u;return l.k.length>t?u=l.k[t]:(u=new Z(l,n),l.k.push(u)),[u.V,u.Z]};
