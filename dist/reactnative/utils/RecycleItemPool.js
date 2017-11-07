"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Warning: works only on string types
/***
 * Recycle pool for maintaining recyclable items, supports segregation by type as well.
 * Availability check, add/remove etc are all O(1), uses two maps to achieve constant time operation
 */
var RecycleItemPool = function () {
    function RecycleItemPool() {
        _classCallCheck(this, RecycleItemPool);

        this._recyclableObjectMap = {};
        this._availabilitySet = {};
    }

    _createClass(RecycleItemPool, [{
        key: "_getRelevantSet",
        value: function _getRelevantSet(objectType) {
            var objectSet = this._recyclableObjectMap[objectType];
            if (!objectSet) {
                objectSet = {};
                this._recyclableObjectMap[objectType] = objectSet;
            }
            return objectSet;
        }
    }, {
        key: "putRecycledObject",
        value: function putRecycledObject(objectType, object) {
            var objectSet = this._getRelevantSet(objectType);
            if (!this._isPresent(this._availabilitySet[object])) {
                objectSet[object] = null;
                this._availabilitySet[object] = objectType;
            }
        }
    }, {
        key: "getRecycledObject",
        value: function getRecycledObject(objectType) {
            var objectSet = this._getRelevantSet(objectType);
            var recycledObject = null;
            for (var property in objectSet) {
                if (objectSet.hasOwnProperty(property)) {
                    recycledObject = property;
                    break;
                }
            }

            if (this._isPresent(recycledObject)) {
                delete objectSet[recycledObject];
                delete this._availabilitySet[recycledObject];
            }
            return recycledObject;
        }
    }, {
        key: "removeFromPool",
        value: function removeFromPool(object) {
            if (this._isPresent(this._availabilitySet[object])) {
                delete this._getRelevantSet(this._availabilitySet[object])[object];
                delete this._availabilitySet[object];
            }
        }
    }, {
        key: "clearAll",
        value: function clearAll() {
            this._recyclableObjectMap = {};
            this._availabilitySet = {};
        }
    }, {
        key: "_isPresent",
        value: function _isPresent(value) {
            return value || value === 0;
        }
    }]);

    return RecycleItemPool;
}();

exports.default = RecycleItemPool;