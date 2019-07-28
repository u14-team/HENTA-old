/* Я отказываюсь это комментировать */
// Rewrite this.
exports.typeOf = function (value) {
    return Array.isArray(value) ? "array" : typeof value;
}

exports.checkTypes = function (argList, typeList) {
    for (var i = 0; i < typeList.length; i++) {
        if (typeOf(argList[i]) !== typeList[i]) {
            throw 'wrong type: expecting ' + typeList[i] + ", found " + typeOf(argList[i]);
        }
    }
}

exports.objectMap = (object, mapFn) => {
  return Object.keys(object).reduce(function(result, key) {
    result[key] = mapFn(key, object[key])
    return result
  }, {})
}

exports.getArrayRandom = items => items[Math.floor(Math.random()*items.length)];
exports.randomElement = items => items[Math.floor(Math.random()*items.length)];
