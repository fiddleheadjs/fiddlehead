/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../output/dist/index.min.js":
/*!***********************************!*\
  !*** ../output/dist/index.min.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nvar _excluded = [\"key\", \"ref\"];\n\nfunction _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }\n\nfunction _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }\n\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _iterableToArray(iter) { if (typeof Symbol !== \"undefined\" && iter[Symbol.iterator] != null || iter[\"@@iterator\"] != null) return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }\n\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \"function\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }, _typeof(obj); }\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== \"undefined\" && arr[Symbol.iterator] || arr[\"@@iterator\"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: !0\n}));\nvar n = null,\n    t = -1;\n\nfunction o() {\n  if (null === n) throw new Error(\"Cannot call hooks from outside of the component\");\n  return [n, ++t];\n}\n\nfunction u(n) {\n  this.current = n;\n}\n\nfunction e(n, t) {\n  return Object.prototype.hasOwnProperty.call(n, t);\n}\n\nfunction i(n) {\n  return \"string\" == typeof n || n instanceof String;\n}\n\nfunction l(n) {\n  return \"number\" == typeof n || n instanceof Number;\n}\n\nfunction r(n) {\n  return n instanceof Function;\n}\n\nfunction c(n) {\n  return n instanceof Array;\n}\n\nfunction f(n) {\n  return null == n;\n}\n\nfunction s(n) {\n  this.t = n, this.o = {}, this.u = null, this.i = null, this.l = [], this.h = null, this.p = [], this.m = \"\", this.v = null, this.g = null, this.j = null, this._ = n === h || n === a ? m : r(n) ? p : w;\n}\n\nvar a = \"[\",\n    h = \"=\",\n    w = 0,\n    p = 1,\n    m = 2;\nvar d = 0;\nvar v = 0;\n\nfunction b(n, t) {\n  n.g = t, n.i instanceof u && (n.i.current = t);\n}\n\nfunction y(n) {\n  if (n instanceof s) return n;\n\n  if (i(n) || l(n)) {\n    var _t = new s(\"#\");\n\n    return _t.o.children = n, _t;\n  }\n\n  if (c(n)) {\n    var _t2 = new s(a);\n\n    var _o = -1;\n\n    for (var _u = 0; _u < n.length; _u++) {\n      var _e = y(n[_u]);\n\n      null !== _e && x(_t2, _e, ++_o);\n    }\n\n    return _t2;\n  }\n\n  return null;\n}\n\nfunction x(n, t, o) {\n  t.h = n, t.v = o, n.p[o] = t;\n}\n\nvar g = new Map();\n\nfunction j(n) {\n  return e(n, \"hook_alias\") ? n.hook_alias : n.hook_alias = function (n) {\n    return n.name + \"{\" + (++d).toString(36);\n  }(n);\n}\n\nfunction _(n, t) {\n  n.hook_vnode = t;\n}\n\nfunction M(n, t) {\n  var _this = this;\n\n  this.M = n, this.k = t, this.N = function (n) {\n    var t;\n    t = r(n) ? n(_this.k) : n, t !== _this.k && (_this.k = t, q(_this.M));\n  };\n}\n\nfunction k(n, t) {\n  var o, u;\n\n  if (n.m = t + \"/\" + (null !== n.u ? (o = n.u, \"@\" + encodeURIComponent(o)) : n.v) + \"/\" + (n._ === p ? j(n.t) : n.t), n._ === p) {\n    var _t3 = (u = n.m, g.get(u) || null);\n\n    if (null !== _t3) {\n      n.l = _t3;\n\n      for (var _t4 = 0; _t4 < n.l.length; _t4++) {\n        var _o2 = n.l[_t4];\n        _o2 instanceof M && (_o2.M = n);\n      }\n    }\n\n    !function (n, t) {\n      g.set(n, t);\n    }(n.m, n.l);\n  }\n\n  for (var _t5 = 0; _t5 < n.p.length; _t5++) {\n    k(n.p[_t5], n.m);\n  }\n}\n\nfunction E(n, t, o) {\n  for (var _u2 in o) {\n    e(o, _u2) && f(t[_u2]) && N(n, _u2, o[_u2]);\n  }\n\n  for (var _u3 in t) {\n    e(t, _u3) && O(n, _u3, t[_u3], o[_u3]);\n  }\n}\n\nfunction N(n, t, o) {\n  var _S = S(t, o),\n      _S2 = _slicedToArray(_S, 2),\n      u = _S2[0],\n      e = _S2[1];\n\n  f(e) || n.removeAttribute(u);\n}\n\nfunction O(n, t, o, u) {\n  var _S3 = S(t, o),\n      _S4 = _slicedToArray(_S3, 2),\n      r = _S4[0],\n      c = _S4[1];\n\n  if (!f(c)) if (\"style\" !== r) {\n    if ((i(c) || l(c)) && n.setAttribute(r, c), r in n) try {\n      n[r] = c;\n    } catch (n) {}\n  } else {\n    if (!f(u)) {\n      var _S5 = S(t, u),\n          _S6 = _slicedToArray(_S5, 2),\n          _o3 = _S6[1];\n\n      if (!f(_o3)) for (var _t6 in _o3) {\n        e(_o3, _t6) && !e(c, _t6) && (n.style[_t6] = \"\");\n      }\n    }\n\n    for (var _t7 in c) {\n      e(c, _t7) && (f(c[_t7]) || (n.style[_t7] = c[_t7]));\n    }\n  }\n}\n\nfunction S(n, t) {\n  return r(t) ? [n.toLowerCase(), t] : \"className\" === n ? c(t) ? [\"class\", t.filter(function (n) {\n    return i(n);\n  }).join(\" \")] : [\"class\", t] : \"class\" === n ? (console.error(\"className instead of class\"), [n]) : \"style\" !== n || f(t) || function (n) {\n    return null !== n && \"object\" == _typeof(n);\n  }(t) ? [n, t] : (console.error(\"Style must be an object\", t), [n]);\n}\n\nfunction C(n) {\n  n.j = function (n) {\n    if (\"svg\" === n.t) return 1;\n    if (1 === n.h.j && \"foreignObject\" === n.h.t) return 0;\n    return n.h.j;\n  }(n);\n\n  var t = function (n) {\n    if (\"#\" === n.t) return t = n.o.children, document.createTextNode(t);\n    var t;\n    {\n      var _t8 = null;\n      return 1 === n.j && (_t8 = \"http://www.w3.org/2000/svg\"), function (n, t, o) {\n        var u = null !== n ? document.createElementNS(n, t) : document.createElement(t);\n        return E(u, o, {}), u;\n      }(_t8, n.t, n.o);\n    }\n  }(n);\n\n  b(n, t), null !== t && _(t, n);\n}\n\nfunction z(n, t) {\n  !function (n, t) {\n    var o = \"\";\n    n.forEach(function (n, u) {\n      if (t.has(u)) {\n        var _o4 = t.get(u);\n\n        b(_o4, n.g), \"#\" === _o4.t ? _o4.o.children !== n.o.children && (e = _o4.g, i = _o4.o.children, e.textContent = i) : E(_o4.g, _o4.o, n.o);\n      } else (function (n, t) {\n        if (n.length < t.length) return !1;\n        var o = 0;\n\n        for (o = t.length - 1; o >= 0; o--) {\n          if (t[o] !== n[o]) return !1;\n        }\n\n        return !0;\n      })(u, o + \"/\") || (!function (n) {\n        var t = F(n);\n\n        for (var _n2 = 0; _n2 < t.length; _n2++) {\n          var _o5 = t[_n2];\n          null !== _o5.parentNode && _o5.parentNode.removeChild(_o5);\n        }\n      }(n), o = u);\n\n      var e, i;\n    });\n  }(n, t), function (n, t) {\n    var o = [];\n    t.forEach(function (t, u) {\n      n.has(u) ? (A(o, n.get(u)), o.length = 0) : o.push(t);\n    }), o.length > 0 && A(o, null);\n  }(n, t);\n}\n\nfunction A(n, t) {\n  var o = t && F(t)[0] || null;\n\n  for (var _t9 = 0; _t9 < n.length; _t9++) {\n    var _u4 = n[_t9];\n\n    if (C(_u4), null !== _u4.g) {\n      var _n3 = D(_u4);\n\n      null !== _n3 && (null !== o && _n3 === o.parentNode ? _n3.insertBefore(_u4.g, o) : _n3.appendChild(_u4.g));\n    }\n  }\n}\n\nfunction D(n) {\n  return n.t === K ? n.g : null === n.h ? null : null === n.h.g ? D(n.h) : n.h.g;\n}\n\nfunction F(n) {\n  if (null !== n.g) return [n.g];\n  {\n    var _t10 = [];\n\n    for (var _o6 = 0; _o6 < n.p.length; _o6++) {\n      var _u5 = n.p[_o6];\n\n      _t10.push.apply(_t10, _toConsumableArray(F(_u5)));\n    }\n\n    return _t10;\n  }\n}\n\nfunction G(n, t, o) {\n  this.O = I, this.S = n, this.C = t, this.A = null, this.D = o;\n}\n\nvar I = 0;\n\nfunction R(n) {\n  n.A = n.S(), void 0 === n.A && (n.A = null);\n}\n\nfunction U(n) {\n  var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;\n  null === n.D || t ? null !== n.A && n.A() : n.D();\n}\n\nfunction V(n) {\n  var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : !1;\n  return null === n ? 1 : 0 === n.length ? 2 : !1 === t || function (n, t) {\n    for (var _o7 = 0; _o7 < n.length; _o7++) {\n      if (n[_o7] !== t[_o7]) return !1;\n    }\n\n    return !0;\n  }(n, t) ? 3 : 4;\n}\n\nfunction q(n) {\n  var t = function (n) {\n    var t = H();\n    return J(n, t), t;\n  }(n),\n      o = function (n) {\n    var t = H();\n    return B(n, t), t;\n  }(n);\n\n  var u, e;\n  u = t.F, e = o.F, u.forEach(function (n, t) {\n    var o = !e.has(t);\n    var u;\n    !function (n, t) {\n      for (var _o8 = 0; _o8 < n.l.length; _o8++) {\n        var _u6 = n.l[_o8];\n        _u6 instanceof G && (null !== _u6.D || null !== _u6.A) && (t || 1 === _u6.O || 4 === _u6.O) && U(_u6, t);\n      }\n    }(n, o), o && (u = n.m, g[\"delete\"](u));\n  }), z(t.G, o.G), function (n, t) {\n    t.forEach(function (t, o) {\n      !function (n, t) {\n        for (var _o9 = 0; _o9 < n.l.length; _o9++) {\n          var _u7 = n.l[_o9];\n          _u7 instanceof G && (t || 1 === _u7.O || 4 === _u7.O) && R(_u7);\n        }\n      }(t, !n.has(o));\n    });\n  }(t.F, o.F);\n}\n\nfunction B(o, u) {\n  if (o._ === p) {\n    u.F.set(o.m, o), n = o, t = -1;\n\n    var _e2 = y(o.t(o.o));\n\n    n = null, t = -1, null !== _e2 && (x(o, _e2, 0), function (n) {\n      for (var _t11 = 0; _t11 < n.p.length; _t11++) {\n        k(n.p[_t11], n.m);\n      }\n    }(o));\n  } else o._ === w && u.G.set(o.m, o);\n\n  for (var _n4 = 0; _n4 < o.p.length; _n4++) {\n    B(o.p[_n4], u);\n  }\n}\n\nfunction H() {\n  return {\n    F: new Map(),\n    G: new Map()\n  };\n}\n\nfunction J(n, t) {\n  n._ === p ? t.F.set(n.m, n) : n._ === w && t.G.set(n.m, n);\n\n  for (var _o10 = 0; _o10 < n.p.length; _o10++) {\n    J(n.p[_o10], t);\n  }\n}\n\nfunction K(_ref) {\n  var n = _ref.children;\n  return n;\n}\n\nfunction L(n, t) {\n  var o;\n\n  if (!(o = t.hook_vnode)) {\n    for (; t.firstChild;) {\n      t.removeChild(t.firstChild);\n    }\n\n    o = new s(K), o.j = \"ownerSVGElement\" in t ? 1 : 0, b(o, t), _(t, o);\n  }\n\n  return o.o.children = n, o;\n}\n\nexports.createPortal = L, exports.h = function (n, t) {\n  var _ref2 = t || {},\n      _ref2$key = _ref2.key,\n      u = _ref2$key === void 0 ? null : _ref2$key,\n      _ref2$ref = _ref2.ref,\n      e = _ref2$ref === void 0 ? null : _ref2$ref,\n      i = _objectWithoutProperties(_ref2, _excluded),\n      l = new s(n);\n\n  for (var _len = arguments.length, o = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {\n    o[_key - 2] = arguments[_key];\n  }\n\n  if (l.o = i, l.u = u, l.i = e, l._ === p) l.o.children = o.length > 1 ? o : o[0];else {\n    var _n5 = 0,\n        _t12 = -1;\n\n    for (_n5 = 0; _n5 < o.length; _n5++) {\n      var _u8 = y(o[_n5]);\n\n      null !== _u8 && x(l, _u8, ++_t12);\n    }\n  }\n  return l;\n}, exports.mount = function (n, t) {\n  var o = L(n, t);\n  o.m = \"~\" + (++v).toString(36), q(o);\n}, exports.useEffect = function (n) {\n  var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;\n\n  var _o11 = o(),\n      _o12 = _slicedToArray(_o11, 2),\n      u = _o12[0],\n      e = _o12[1];\n\n  if (u.l.length > e) {\n    var _o13 = u.l[e];\n    if ((null !== t || null !== _o13.C) && t.length !== _o13.C.length) throw new Error(\"Deps must be size-fixed\");\n\n    var _i2 = V(t, _o13.C);\n\n    if (2 === _i2) return;\n    if (3 === _i2) return void (_o13.O = _i2);\n\n    if (1 === _i2 || 4 === _i2) {\n      var _l = new G(n, t, _o13.A);\n\n      return _l.O = _i2, void (u.l[e] = _l);\n    }\n\n    return;\n  }\n\n  var i = new G(n, t, null);\n  i.O = V(t), u.l.push(i);\n}, exports.useRef = function (n) {\n  var _o14 = o(),\n      _o15 = _slicedToArray(_o14, 2),\n      t = _o15[0],\n      e = _o15[1];\n\n  if (t.l.length > e) return t.l[e];\n  var i = new u(n);\n  return t.l.push(i), i;\n}, exports.useState = function (n) {\n  var _o16 = o(),\n      _o17 = _slicedToArray(_o16, 2),\n      t = _o17[0],\n      u = _o17[1];\n\n  var e;\n  return t.l.length > u ? e = t.l[u] : (e = new M(t, n), t.l.push(e)), [e.k, e.N];\n};\n\n//# sourceURL=webpack://sandbox/../output/dist/index.min.js?");

/***/ }),

/***/ "./src/form.js":
/*!*********************!*\
  !*** ./src/form.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../output/dist/index.min.js */ \"../output/dist/index.min.js\");\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== \"undefined\" && arr[Symbol.iterator] || arr[\"@@iterator\"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArray(iter) { if (typeof Symbol !== \"undefined\" && iter[Symbol.iterator] != null || iter[\"@@iterator\"] != null) return Array.from(iter); }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\nfunction Cat(_ref) {\n  var text = _ref.text,\n      setText = _ref.setText;\n\n  //console.log('run Cat', text);\n  var _useState = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)(1),\n      _useState2 = _toArray(_useState);\n\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    // //console.log('mount Lazy effect Cat');\n    return function () {// //console.log('destroy Lazy effect Cat');\n    };\n  }, []);\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    //console.log('mount Deps effect Cat', text);\n    return function () {//console.log('destroy Deps effect Cat', text);\n    };\n  }, [text]);\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", {\n    className: \"Cat\"\n  }, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"span\", null, \"Ad name: \"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"input\", {\n    type: \"text\",\n    value: text,\n    onInput: function onInput(ev) {\n      return setText(ev.target.value);\n    }\n  })));\n}\n\nfunction Dog(_ref2) {\n  var text = _ref2.text,\n      setText = _ref2.setText;\n\n  // //console.log('run Dog', text);\n  var _useState3 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)('gruuu'),\n      _useState4 = _slicedToArray(_useState3, 2),\n      speak = _useState4[0],\n      setSpeak = _useState4[1];\n\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    // //console.log('mount Lazy effect Dog');\n    return function () {// //console.log('destroy Lazy effect Dog');\n    };\n  }, []);\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    // //console.log('mount Deps effect Dog', text);\n    return function () {// //console.log('destroy Deps effect Dog', text);\n    };\n  }, [text]);\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", {\n    className: \"Dog\"\n  }, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"span\", null, \"Ad name: \"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"input\", {\n    type: \"text\",\n    value: text,\n    onChange: function onChange(ev) {\n      return setText(ev.target.value);\n    }\n  })), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, \"Speak:\", ' ', (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"input\", {\n    value: speak,\n    onChange: function onChange(ev) {\n      return setSpeak(ev.target.value);\n    }\n  })));\n}\n\nfunction Bird(_ref3) {\n  var layout = _ref3.layout,\n      text = _ref3.text,\n      setText = _ref3.setText;\n\n  var _useState5 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)(),\n      _useState6 = _toArray(_useState5);\n\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    //console.log('mount Lazy effect Bird');\n    return function () {//console.log('destroy Lazy effect Bird');\n    };\n  }, []); // useEffect(() => {\n  //     // //console.log('mount Always effect Bird');\n  //\n  //     return () => {\n  //         // //console.log('destroy Always effect Bird');\n  //     };\n  // });\n\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", {\n    className: \"Bird\"\n  }, layout === 'dog' && (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Dog, {\n    text: text,\n    setText: setText\n  }), layout === 'cat' && (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Cat, {\n    text: text,\n    setText: setText\n  }));\n}\n\nfunction YourAd(_ref4) {\n  var count = _ref4.count,\n      setCount = _ref4.setCount;\n\n  var _useState7 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)('cat'),\n      _useState8 = _slicedToArray(_useState7, 2),\n      layout = _useState8[0],\n      setLayout = _useState8[1];\n\n  var _useState9 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)('unnamed'),\n      _useState10 = _slicedToArray(_useState9, 2),\n      name = _useState10[0],\n      setName = _useState10[1]; //console.log('name', name);\n\n\n  var selectRef = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    // //console.log('mount Lazy effect YourAd');\n    return function () {// //console.log('destroy Lazy effect YourAd');\n    };\n  }, []);\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    //console.log('+ select_element', selectRef.current);\n    return function () {//console.log('- select_element', selectRef.current);\n    };\n  });\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    // //console.log('mount Deps effect YourAd', layout, name);\n    return function () {// //console.log('destroy Deps effect YourAd', layout, name);\n    };\n  }, [layout, name]);\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"form\", {\n    className: \"YourAd\",\n    style: {\n      padding: '16px',\n      border: '1px solid #ccc'\n    }\n  }, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"span\", null, \"Your Ad: \", name)), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"select\", {\n    ref: selectRef,\n    onChange: function onChange(ev) {\n      return setLayout(ev.target.value);\n    }\n  }, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"option\", {\n    value: \"cat\",\n    selected: layout === 'cat'\n  }, \"Layout Cat\"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"option\", {\n    value: \"dog\",\n    selected: layout === 'dog'\n  }, \"Layout Dog\"))), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, layout === 'cat' && (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, {\n    key: \"#hehe/hahaha mm\"\n  }, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, \"This is cat layout.\"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Cat, {\n    text: name,\n    setText: setName\n  })), layout === 'dog' && (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, \"This is not default layout, update from ancestor might reset the state of this part if tree updating logic not correct.\"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Dog, {\n    text: name,\n    setText: setName\n  }))), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"strong\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"i\", null, \"This is Bird container\"))), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Bird, {\n    layout: layout,\n    text: name,\n    setText: setName\n  })), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"br\", null), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"button\", {\n    type: \"button\",\n    onClick: function onClick() {\n      setCount(function (count) {\n        return count + 1;\n      });\n    }\n  }, \"Update count\"), ' ', (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"span\", null, \"Re-renders:\", count)));\n}\n\nfunction Wrapper(_ref5) {\n  var children = _ref5.children;\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"div\", {\n    className: \"Wrapper\"\n  }, children);\n}\n\nfunction MyAd() {\n  var _useState11 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)(1),\n      _useState12 = _slicedToArray(_useState11, 2),\n      count = _useState12[0],\n      setCount = _useState12[1];\n\n  var adRef = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\n  (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    //console.log('+ ad_element', adRef.current);\n    return function () {//console.log('- ad_element', adRef.current);\n    };\n  });\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"article\", {\n    className: \"MyAd\"\n  }, [false, 1, 2, [4, 5], ' Count: ', count], (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"inner\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"my-div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"love-div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"test-div\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"a\", null, \"link\"), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, \"test\", (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Wrapper, null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(YourAd, {\n    ref: adRef,\n    count: count,\n    setCount: setCount\n  }))))))), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"b\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"i\", null, \"hehe\"))))));\n}\n\nfunction Demo() {\n  var _useState13 = (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.useState)(true),\n      _useState14 = _slicedToArray(_useState13, 2),\n      shows = _useState14[0],\n      setShows = _useState14[1]; //console.log('shows', shows);\n\n\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)('=', null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"paragraph\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"input\", {\n    type: \"checkbox\",\n    checked: shows,\n    onChange: function onChange(ev) {\n      return setShows(function (shows) {\n        return !shows;\n      });\n    }\n  }), (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"h2\", null, \"Demo\"), \"hello\", shows && (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(MyAd, null)));\n}\n\nfunction DemoWrapper() {\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(Demo, null);\n}\n\nfunction DemoWrapperWrapper() {\n  return (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(\"hh-ff\", null, (0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(DemoWrapper, null));\n}\n\nconsole.time('stack');\n(0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.mount)((0,_output_dist_index_min_js__WEBPACK_IMPORTED_MODULE_0__.h)(DemoWrapperWrapper, null), document.getElementById('sandbox-container'));\nconsole.timeEnd('stack');\n\n//# sourceURL=webpack://sandbox/./src/form.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/form.js");
/******/ 	
/******/ })()
;