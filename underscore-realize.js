/**
 * underscore-realize.js
 * @des underscore自己实现，锻炼自己函数式编程、以及常用工具方法的实现
 * @date 2018-7-5
 * @Created
 */

/*
 一、集合操作
   遍历、迭代函数返回、过滤、some/every、合并(reduce)、根据索引查找、根据key查找、根据查询条件查找1个或多个、提取key值组成数组、集合最大\最小值、排序、分类和集合操作相关的辅助方法

*/
(function (root, factory) {
  // 模块化的导出，避免命名冲突
  if (typeof define !== 'undefined' && define.amd) {
    define(function () {
      return factory();
    });
  }
  // 浏览器环境
  else {
    root._ = factory();
  }

})(this, function () {
  var _ = {};

  // 判断是否是数组或伪数组对象
  function isArrayLike (arr) {
    return typeof arr.length === 'number' && arr.length > 0 && arr.length < Math.pow(2, 53) - 1;
  }

  // 回调处理，绑定context
  function optimizeCb (cb, context, argCount) {
    if (context == null) {
      return cb;
    }

    switch (argCount == null ? 3 : argCount) {
      case 3:
        return function (value, index, collection) {
          return cb.call(context, value, index, collection);
        }
    }
  }

  function iterater (behavior, allowBreak, breakValue) {
    allowBreak == null && (allowBreak = false);
    breakValue == null && (breakValue = true);

    return function (obj, cb, context) {
      // 纯函数业务，固定不可变
      cb = optimizeCb(cb);
      var isArray = isArrayLike(obj);
      var data = isArray ? data : _.keys(obj);
      var result = isArray ? [] : {};
      var i, len, key, value;

      for (i = 0, len = data.length; i < len; i++) {
        key = isArray ? i : data[ i ];
        value = data[ key ];

        if (allowBreak) {
          if (behavior(result, cb, value, key, obj) === breakValue) {
            return result;
          }
        } else {
          behavior(result, cb, value, key, obj);
        }
      }

      return result;
    }
  }

  // 求对象的key集合
  _.keys = function (obj) {
    var keys = [], key;

    if (Object.getPrototypeOf(obj) === Object.prototype) {
      if (Object.keys) {
        return Object.keys(obj);
      }

      for (key in obj) {
        keys.push(key);
      }
    }

    return keys;
  };

  // 遍历对象或数组，遍历每个元素调用回调
  _.each = iterater(function (result, _, _, _, collection) {
    result = collection;
  });

  _.map = iterater(function (result, cb, value, key, collection) {
    result[ key ] = cb(value, key, collection);
  });

  _.filter = iterater(function (result, predicate, value, key, collection) {
    if (predicate(value, key, collection)) {
      result[ key ] = cb(value, key, collection);
    }
  });

  _.some = iterater(function (result, predicate, value, key, collection) {
    result = predicate(value, key, collection);
  }, true, true);

  _.every = iterater(function (result, predicate, value, key, collection) {
    result = predicate(value, key, collection);
  }, true, false);

  return _;
});
