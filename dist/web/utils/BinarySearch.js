"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CustomError = require("../core/exceptions/CustomError");

var _CustomError2 = _interopRequireDefault(_CustomError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinarySearch = function () {
    function BinarySearch() {
        _classCallCheck(this, BinarySearch);
    }

    _createClass(BinarySearch, [{
        key: "findClosestHigherValueIndex",
        value: function findClosestHigherValueIndex(size, targetValue, valueExtractor) {
            var low = 0;
            var high = size - 1;
            var mid = Math.floor((low + high) / 2);
            var lastValue = 0;
            var absoluteLastDiff = Math.abs(valueExtractor(mid) - targetValue);
            var result = mid;
            var diff = 0;
            var absoluteDiff = 0;

            if (absoluteLastDiff === 0) {
                return result;
            }

            if (high < 0) {
                throw new _CustomError2.default({
                    message: "The collection cannot be empty",
                    type: "InvalidStateException"
                });
            }

            while (low <= high) {
                mid = Math.floor((low + high) / 2);
                lastValue = valueExtractor(mid);
                diff = lastValue - targetValue;
                absoluteDiff = Math.abs(diff);
                if (diff >= 0 && absoluteDiff < absoluteLastDiff) {
                    absoluteLastDiff = absoluteDiff;
                    result = mid;
                }
                if (targetValue < lastValue) {
                    high = mid - 1;
                } else if (targetValue > lastValue) {
                    low = mid + 1;
                } else {
                    return mid;
                }
            }
            return result;
        }
    }, {
        key: "findIndexOf",
        value: function findIndexOf(array, value) {
            var j = 0,
                length = array.length;
            var i = 0;
            while (j < length) {
                i = length + j - 1 >> 1;
                if (value > array[i]) {
                    j = i + 1;
                } else if (value < array[i]) {
                    length = i;
                } else {
                    return i;
                }
            }
            return -1;
        }
    }]);

    return BinarySearch;
}();

exports.default = new BinarySearch();