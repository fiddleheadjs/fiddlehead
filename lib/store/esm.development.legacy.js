import { useState, useEffect } from 'hook';
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


var useReadableStore = function useReadableStore(store, readFn, compareFn) {
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


var useWritableStore = function useWritableStore(store, writeFn) {
  return function (value) {
    store.setData(function (data) {
      writeFn(data, value);
    });
  };
};

export { createStore, useReadableStore, useWritableStore };
