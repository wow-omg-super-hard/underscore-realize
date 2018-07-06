/**
 * underscore-realize.js
 * @des underscore自己实现，锻炼自己函数式编程、以及常用工具方法的实现
 * @date 2018-7-5
 * @Created
 */

/*
 一、集合操作
   遍历、迭代函数返回、过滤、some/every、合并(reduce)、根据索引查找、根据key查找、根据查询条件查找1个或多个、提取key值组成数组、集合最大\最小值、打乱数组结构、排序、分类和集合操作相关的辅助方法

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
          result = behavior(cb, value, key, obj)

          if (result === breakValue) {
            return result;
          }
        } else {
          behavior(result, cb, value, key, obj);
        }
      }

      return result;
    }
  }

  /**
   * 创建索引查询器
  */
  function createIndexFinder (dir) {
    return function (arr, findCb, context) {
      findCb = optimizeCb(findCb, context);
      var index = dir > 0 : 0 : arr.length - 1;

      for (; index < arr.length && index >= 0; index += dir) {
        if (findCb(arr[ index ], index, arr) === true) {
          return index;
        }
      }

      return -1;
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

  _.some = iterater(function (predicate, value, key, collection) {
    return predicate(value, key, collection);
  }, true, true);

  _.every = iterater(function (predicate, value, key, collection) {
    return predicate(value, key, collection);
  }, true, false);

  _.findIndex = createIndexFinder(1);
  _.findLastIndex = createIndexFinder(-1);

  _.findKey = function (obj, findCb, context) {
    findCb = optimizeCb(findCb, context);
    var keys = _.keys(obj);
    var i, len;

    for (i = 0, len = keys.length; i < len; i++) {
      if (findCb(obj[ keys[ i ] ], keys[ i ], obj) === true) {
        return key;
      }
    }
  };

  _.find = function (obj, findCb, context) {
    var key;

    if (isArrayLike(obj)) {
      key = _.findIndex(obj, findCb, context);
    } else {
      key = _.findKey(obj, findCb, context);
    }

    if (key !== -1 && key != null) {
      return obj[ key ];
    }
  };

  _.isMatch = function (prop, where) {
    for (var key in where) {
      if (isNaN(where[ key ]) && isNaN(prop[ key ])) {
        return true;
      }

      if (where[ key ] === prop[ key ] && (key in prop)) {
        return true;
      }
    }

    return false;
  }

  _.findWhere = function (obj, where) {
    return _.find(obj, function (value) {
      // 判断value中是否包含where，遍历条件对象，判断该对象的属性是否和被比较对象的属性是否相等，而且双方不能为undefined，还有判断是否是NaN
      return _.isMatch(value, where);
    });
  };

  _.where = function (obj, where) {
    return _.filter(obj, function (value) {
      return _.isMatch(value, where);
    });
  };

  // 取对象的属性
  _.property = function (key) {
    return function (obj) {
      // 如果为null，也将他们设置undefined
      return obj[ key ] == null ? void 0 : obj[ key ];
    };
  };

  _.values = function (obj) {
    var keys = _.keys(obj);
    var i = 0;
    var len = keys.length;
    var values = Array(len);

    for (; i < len; i++) {
      values[ i ] = obj[ keys[ i ] ];
    }

    return values;
  };

  // 提取数组对象的值组成数组
  _.pluck = function (arr, key) {
    return _.map(arr, _.property(key));
  };

  // 数组或者对象中每个元素都调用method，然后集合成数组
  _.invoke = function (arr, method) {
    var args = Array.prototype.slice.call(arguments, 2);
    var isFunc = typeof method === 'function';
    var func;

    return _.map(arr, function (value) {
      func = isFunc ? method : value[ 'method' ];

      return func == null ? func : func.apply(value, args);
    });
  }

  function createDiffer (simpleDiff, invokeDiff) {
    return function (obj, cb, context) {
      var lastComputed = -Infinity;
      var computed, result;

      if (cb == null) {
        return simpleDiff(isArrayLike(obj) ? obj : _.values(obj));
      } else {
        cb = optimizeCb(cb, context);

        _.each(obj, function (value, key, list) {
          computed = cb(value, key, list);

          if (invokeDiff(computed, lastComputed)) {
            result = value;
            lastComputed = computed;
          }
        });

        return result;
      }
    }
  }

  // 求集合最大\最小值或集合中的元素执行方法后的比较最大最小值,返回当前value
  _.max = createDiffer(
    function (data) {
      return Math.max.apply(null, data);
    },
    function (computed, lastComputed) {
      return computed > lastComputed;
    }
  );

  _.min = createDiffer(
    function (data) {
      return Math.min.apply(null, data)
    },
    function (computed, lastComputed) {
      return computed < lastComputed;
    }
  );


  // 数组乱序
  // 数组倒序遍历
  // 求最大值为当前索引的随机数，随机索引和当前索引的值交换位置
  _.shuffle = function (arr) {
    var index = arr.length - 1;
    var rand, temp;

    for (; index--; ) {
      rand = Math.floor(Math.random() * (index + 1));
      temp = arr[ rand ];
      arr[ rand ] = arr[ index ];
      arr[ index ] = temp;
    }

    return arr;
  };

  // 排序
  _.sortBy = function (arr, cb, context) {
    cb = optimizeCb(cb, context);
    var result = _.map(arr, function (value, index, list) {
      return {
        value: value,
        criteria: cb ? cb(value, index, list) : void 0
      };
    }).sort(function (left, right) {
      var leftCriteria = left.criteria;
      var rightCriteria = right.criteria;

      // 如果是没有传入执行函数
      if (leftCriteria === void 0) {
        return left.value - right.value;
      } else {
        return leftCriteria - rightCriteria;
      }
    });

    return _.pluck(result, 'value');
  };

  function group (behavior) {
    return function (obj, cb, context) {
      cb = optimizeCb(cb, context);
      var result = {}, key;

      _.each(obj, function (value, index, list) {
        key = cb(value, index, list);

        behavior(result, value, key, index, list);
      });

      return result;
    };
  }

  // 根据key分组
  _.groupBy = group(function (result, value, key) {
    if (key in result) {
      result[ key ].push(value);
    } else {
      result[ key ] = [ value ];
    }
  });

  // 根据key统计出现个数
  _.countBy = group(function (result, _, key) {
    if (key in result) {
      result[ key ] += 1
    } else {
      result[ key ] = 1;
    }
  });

  return _;
});
