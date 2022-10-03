'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var core_pkg = require('hook');
/**
 * 
 * @param {{}} initialData 
 * @returns {Store}
 */


var createStore = function createStore(initialData) {
  if (!(initialData != null && // is not nullish
  initialData.constructor === Object)) {
    throw new Error('Store data must be a plain object');
  }

  var data = initialData;
  var subscribers = new Set();
  return {
    get data() {
      return data;
    },

    setData: function setData(setFn) {
      setFn(data);
      subscribers.forEach(function (subscriber) {
        subscriber(data);
      });
    },
    subscribe: subscribers.add.bind(subscribers),
    unsubscribe: subscribers["delete"].bind(subscribers)
  };
};
/**
 * 
 * @param {Store} store
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 */


var useGlobalStoreRead = function useGlobalStoreRead(store, readFn, compareFn) {
  var datum = core_pkg.useState(readFn(store.data));
  core_pkg.useEffect(function () {
    var subscriber = function subscriber(data) {
      if (compareFn === undefined) {
        datum[1](readFn(data));
      } else {
        datum[1](function (prevValue) {
          var newValue = readFn(data);

          if (compareFn(prevValue, newValue)) {
            return prevValue;
          } else {
            return newValue;
          }
        });
      }
    };

    store.subscribe(subscriber);
    return function () {
      store.unsubscribe(subscriber);
    };
  }, [store, readFn, compareFn]);
  return datum[0];
};
/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */


var useGlobalStoreWrite = function useGlobalStoreWrite(store, writeFn) {
  return function (value) {
    store.setData(function (data) {
      writeFn(data, value);
    });
  };
};
/**
 * @type {WeakMap<VNode, WeakMap<object, Store>}
 */


var storesMap = new WeakMap();
/**
 * 
 * @param {object} scope
 * @param {{}} initialData 
 */

var useStoreInit = function useStoreInit(scope, initialData) {
  var rootVNode = core_pkg.resolveRootVNode();
  var scoped = storesMap.get(rootVNode);

  if (scoped === undefined) {
    scoped = new WeakMap();
    storesMap.set(rootVNode, scoped);
  }

  if (scoped.has(scope)) {
    if (true) {
      console.error('Store already has been initialized');
    }
  } else {
    scoped.set(scope, createStore(initialData));
  }
};
/**
 * 
 * @param {object} scope
 * @returns {Store}
 * @throws
 */


var useStore = function useStore(scope) {
  var store;
  var rootVNode = core_pkg.resolveRootVNode();
  var scoped = storesMap.get(rootVNode);

  if (scoped !== undefined) {
    store = scoped.get(scope);
  }

  if (store === undefined) {
    throw new Error('Store has not been initialized');
  }

  return store;
};
/**
 * 
 * @param {object} scope
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 * @throws
 */


var useStoreRead = function useStoreRead(scope, readFn, compareFn) {
  var store = useStore(scope);
  return useGlobalStoreRead(store, readFn, compareFn);
};
/**
 * 
 * @param {object} scope
 * @param {function} writeFn
 * @returns {function}
 * @throws
 */


var useStoreWrite = function useStoreWrite(scope, writeFn) {
  var store = useStore(scope);
  return useGlobalStoreWrite(store, writeFn);
};

exports.createStore = createStore;
exports.useGlobalStoreRead = useGlobalStoreRead;
exports.useGlobalStoreWrite = useGlobalStoreWrite;
exports.useStoreInit = useStoreInit;
exports.useStoreRead = useStoreRead;
exports.useStoreWrite = useStoreWrite;
