import { useState, useEffect, resolveRootVNode } from 'hook';
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


var useGlobalReadableStore = function useGlobalReadableStore(store, readFn, compareFn) {
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


var useGlobalWritableStore = function useGlobalWritableStore(store, writeFn) {
  return function (value) {
    store.setData(function (data) {
      writeFn(data, value);
    });
  };
};
/**
 * @type {WeakMap<Store>}
 */


var storeMap = new WeakMap();
/**
 * 
 * @param {{}} initialData 
 */

var applyStore = function applyStore(initialData) {
  var rootVNode = resolveRootVNode();

  if (storeMap.has(rootVNode)) {
    if (true) {
      console.error('Store already has been applied');
    }
  } else {
    storeMap.set(rootVNode, createStore(initialData));
  }
};
/**
 * 
 * @returns {Store}
 * @throws
 */


var useStore = function useStore() {
  var rootVNode = resolveRootVNode();
  var store = storeMap.get(rootVNode);

  if (store === undefined) {
    throw new Error('Store has not been applied');
  }

  return store;
};
/**
 * 
 * @param {function} readFn
 * @param {function?} compareFn
 * @returns {any}
 * @throws
 */


var useReadableStore = function useReadableStore(readFn, compareFn) {
  var store = useStore();
  return useGlobalReadableStore(store, readFn, compareFn);
};
/**
 * 
 * @param {function} writeFn
 * @returns {function}
 * @throws
 */


var useWritableStore = function useWritableStore(writeFn) {
  var store = useStore();
  return useGlobalWritableStore(store, writeFn);
};

export { applyStore, createStore, useGlobalReadableStore, useGlobalWritableStore, useReadableStore, useWritableStore };
