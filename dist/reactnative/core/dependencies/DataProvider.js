"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
 * You can create a new instance or inherit and override default methods
 * Allows access to data and size. Clone with rows creates a new data provider and let listview know where to calculate row layout from.
 */
var DataProvider = function () {
    function DataProvider(rowHasChanged) {
        _classCallCheck(this, DataProvider);

        if (rowHasChanged) {
            this.rowHasChanged = rowHasChanged;
        }
        this._firstIndexToProcess = 0;
        this._size = 0;
    }

    _createClass(DataProvider, [{
        key: "getDataForIndex",
        value: function getDataForIndex(index) {
            return this._data[index];
        }
    }, {
        key: "getSize",
        value: function getSize() {
            return this._size;
        }

        //No need to override this one

    }, {
        key: "cloneWithRows",
        value: function cloneWithRows(newData) {
            var dp = new DataProvider(this.rowHasChanged);
            var newSize = newData.length;
            var iterCount = Math.min(this._size, newSize);
            var i = 0;
            for (i = 0; i < iterCount; i++) {
                if (this.rowHasChanged(this._data[i], newData[i])) {
                    break;
                }
            }
            dp._firstIndexToProcess = i;
            dp._data = newData;
            dp._size = newSize;
            return dp;
        }
    }]);

    return DataProvider;
}();

exports.default = DataProvider;