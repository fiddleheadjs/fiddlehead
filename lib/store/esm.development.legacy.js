import { useState, useEffect, useTreeId } from 'fiddlehead';
/**
 * 
 * @param {{}} initialData 
 * @returns {Store}
 */

var createStore = function createStore(initialData) {
  if (!(initialData != null && // not nullish
  initialData.constructor === Object)) {
    throw new TypeError('The store\'s data must be a plain object.');
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
  var datum = useState(readFn(store.data));
  useEffect(function () {
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
 * @type {WeakMap<object, WeakMap<object, Store>}
 */


var storesMap = new WeakMap();
/**
 * 
 * @param {object} scope
 * @param {{}} initialData 
 */

var useStoreInit = function useStoreInit(scope, initialData) {
  var treeId = useTreeId();
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
  var treeId = useTreeId();
  var scoped = storesMap.get(treeId);

  if (scoped !== undefined) {
    store = scoped.get(scope);
  }

  if (store === undefined) {
    throw new ReferenceError('Cannot access a store before initialization.');
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

export { createStore, useGlobalStoreRead, useGlobalStoreWrite, useStoreInit, useStoreRead, useStoreWrite };
