'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var core_pkg = require('fiddlehead');
/**
 * 
 * @param {object} data 
 * @returns {Store}
 */


var createStore = function createStore(data) {
  if (data !== Object(data)) {
    throw new TypeError('The store data must be a reference type.');
  }

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
    }; // readFn and compareFn must be pure functions
    // we only accept ones was passed from the first call
  }, [store]);
  return datum[0];
};
/**
 * 
 * @param {Store} store
 * @param {function} writeFn
 * @returns {function}
 */


var useGlobalStoreWrite = function useGlobalStoreWrite(store, writeFn) {
  return core_pkg.useCallback(function (value) {
    store.setData(function (data) {
      writeFn(value, data);
    }); // writeFn must be a pure function
    // we only accept one was passed from the first call
  }, [store]);
};
/**
 * @type {WeakMap<object, WeakMap<object, Store>}
 */


var storesMap = new WeakMap();
/**
 * 
 * @param {object} scope
 * @param {object} data 
 */

var useStoreInit = function useStoreInit(scope, data) {
  if (scope !== Object(scope)) {
    throw new TypeError('The store scope must be a reference type.');
  }

  var treeId = core_pkg.useTreeId();
  var scoped = storesMap.get(treeId);

  if (scoped === undefined) {
    scoped = new WeakMap();
    storesMap.set(treeId, scoped);
  }

  if (scoped.has(scope)) {
    if (true) {
      console.warn('The store already has been initialized.');
    }
  } else {
    scoped.set(scope, createStore(data));
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
  var treeId = core_pkg.useTreeId();
  var scoped = storesMap.get(treeId);

  if (scoped !== undefined) {
    store = scoped.get(scope);
  }

  if (store === undefined) {
    throw new ReferenceError('Attempting to access an uninitialized store.');
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
