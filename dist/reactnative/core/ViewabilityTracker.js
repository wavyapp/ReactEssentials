"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BinarySearch = require("../utils/BinarySearch");

var _BinarySearch2 = _interopRequireDefault(_BinarySearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
 * Given an offset this utility can compute visible items. Also tracks previously visible items to compute items which get hidden or visible
 * Virtual renderer uses callbacks from this utility to main recycle pool and the render stack.
 * The utility optimizes finding visible indexes by using the last visible items. However, that can be slow if scrollToOffset is explicitly called.
 * We use binary search to optimize in most cases like while finding first visible item or initial offset. In future we'll also be using BS to speed up
 * scroll to offset.
 */
var ViewabilityTracker = function () {
    function ViewabilityTracker(renderAheadOffset, initialOffset) {
        _classCallCheck(this, ViewabilityTracker);

        this._layouts = null;
        this._currentOffset = Math.max(0, initialOffset);
        this._maxOffset = null;
        this._renderAheadOffset = renderAheadOffset;
        this._visibleWindow = { start: 0, end: 0 };
        this._engagedWindow = { start: 0, end: 0 };

        this._isHorizontal = false;
        this._windowBound = 0;

        this._visibleIndexes = []; //needs to be sorted
        this._engagedIndexes = []; //needs to be sorted

        this.onVisibleRowsChanged = null;
        this.onEngagedRowsChanged = null;

        this._relevantDim = { startBound: 0, endBound: 0 };

        this._valueExtractorForBinarySearch = this._valueExtractorForBinarySearch.bind(this);
    }

    _createClass(ViewabilityTracker, [{
        key: "init",
        value: function init() {
            this._doInitialFit(this._currentOffset);
        }
    }, {
        key: "setLayouts",
        value: function setLayouts(layouts, maxOffset) {
            this._layouts = layouts;
            this._maxOffset = maxOffset;
        }
    }, {
        key: "setDimensions",
        value: function setDimensions(dimensions, isHorizontal) {
            this._isHorizontal = isHorizontal;
            this._windowBound = isHorizontal ? dimensions.width : dimensions.height;
        }
    }, {
        key: "forceRefresh",
        value: function forceRefresh() {
            var shouldForceScroll = this._currentOffset >= this._maxOffset - this._windowBound;
            this.forceRefreshWithOffset(this._currentOffset);
            return shouldForceScroll;
        }
    }, {
        key: "forceRefreshWithOffset",
        value: function forceRefreshWithOffset(offset) {
            this._currentOffset = -1;
            this.updateOffset(offset);
        }
    }, {
        key: "updateOffset",
        value: function updateOffset(offset) {
            offset = Math.min(this._maxOffset, Math.max(0, offset));
            if (this._currentOffset !== offset) {
                this._currentOffset = offset;
                this._updateTrackingWindows(offset);
                var startIndex = 0;
                if (this._visibleIndexes.length > 0) {
                    startIndex = this._visibleIndexes[0];
                }
                this._fitAndUpdate(startIndex);
            }
        }
    }, {
        key: "getLastOffset",
        value: function getLastOffset() {
            return this._currentOffset;
        }
    }, {
        key: "findFirstLogicallyVisibleIndex",
        value: function findFirstLogicallyVisibleIndex() {
            var relevantIndex = this._findFirstVisibleIndexUsingBS(0.001);
            var result = relevantIndex;
            for (var i = relevantIndex - 1; i >= 0; i--) {
                if (this._isHorizontal) {
                    if (this._layouts[relevantIndex].x !== this._layouts[i].x) {
                        break;
                    } else {
                        result = i;
                    }
                } else {
                    if (this._layouts[relevantIndex].y !== this._layouts[i].y) {
                        break;
                    } else {
                        result = i;
                    }
                }
            }
            return result;
        }
    }, {
        key: "_findFirstVisibleIndexOptimally",
        value: function _findFirstVisibleIndexOptimally() {
            var firstVisibleIndex = 0;

            //TODO: Talha calculate this value smartly
            if (this._currentOffset > 5000) {
                firstVisibleIndex = this._findFirstVisibleIndexUsingBS();
            } else if (this._currentOffset > 0) {
                firstVisibleIndex = this._findFirstVisibleIndexLinearly();
            }
            return firstVisibleIndex;
        }
    }, {
        key: "_fitAndUpdate",
        value: function _fitAndUpdate(startIndex) {
            var newVisibleItems = [];
            var newEngagedItems = [];
            this._fitIndexes(newVisibleItems, newEngagedItems, startIndex, true);
            this._fitIndexes(newVisibleItems, newEngagedItems, startIndex + 1, false);
            this._diffUpdateOriginalIndexesAndRaiseEvents(newVisibleItems, newEngagedItems);
        }
    }, {
        key: "_doInitialFit",
        value: function _doInitialFit(offset) {
            offset = Math.min(this._maxOffset, Math.max(0, offset));
            this._updateTrackingWindows(offset);
            var firstVisibleIndex = this._findFirstVisibleIndexOptimally();
            this._fitAndUpdate(firstVisibleIndex);
        }

        //TODO:Talha switch to binary search and remove atleast once logic in _fitIndexes

    }, {
        key: "_findFirstVisibleIndexLinearly",
        value: function _findFirstVisibleIndexLinearly() {
            var count = this._layouts.length;
            var itemRect = null;
            var relevantDim = { startBound: 0, endBound: 0 };

            for (var i = 0; i < count; i++) {
                itemRect = this._layouts[i];
                this._setRelevantBounds(itemRect, relevantDim);
                if (this._itemIntersectsVisibleWindow(relevantDim.startBound, relevantDim.endBound)) {
                    return i;
                }
            }
        }
    }, {
        key: "_findFirstVisibleIndexUsingBS",
        value: function _findFirstVisibleIndexUsingBS() {
            var bias = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var count = this._layouts.length;
            return _BinarySearch2.default.findClosestHigherValueIndex(count, this._visibleWindow.start + bias, this._valueExtractorForBinarySearch);
        }
    }, {
        key: "_valueExtractorForBinarySearch",
        value: function _valueExtractorForBinarySearch(index) {
            var itemRect = this._layouts[index];
            this._setRelevantBounds(itemRect, this._relevantDim);
            return this._relevantDim.endBound;
        }

        //TODO:Talha Optimize further in later revisions, alteast once logic can be replace with a BS lookup

    }, {
        key: "_fitIndexes",
        value: function _fitIndexes(newVisibleIndexes, newEngagedIndexes, startIndex, isReverse) {
            var count = this._layouts.length;
            var relevantDim = { startBound: 0, endBound: 0 };
            var i = 0;
            var atLeastOneLocated = false;
            if (startIndex < count) {
                if (!isReverse) {
                    for (i = startIndex; i < count; i++) {
                        if (this._checkIntersectionAndReport(i, false, relevantDim, newVisibleIndexes, newEngagedIndexes)) {
                            atLeastOneLocated = true;
                        } else {
                            if (atLeastOneLocated) {
                                break;
                            }
                        }
                    }
                } else {
                    for (i = startIndex; i >= 0; i--) {
                        if (this._checkIntersectionAndReport(i, true, relevantDim, newVisibleIndexes, newEngagedIndexes)) {
                            atLeastOneLocated = true;
                        } else {
                            if (atLeastOneLocated) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: "_checkIntersectionAndReport",
        value: function _checkIntersectionAndReport(index, insertOnTop, relevantDim, newVisibleIndexes, newEngagedIndexes) {
            var itemRect = this._layouts[index];
            var isFound = false;
            this._setRelevantBounds(itemRect, relevantDim);
            if (this._itemIntersectsVisibleWindow(relevantDim.startBound, relevantDim.endBound)) {
                if (insertOnTop) {
                    newVisibleIndexes.splice(0, 0, index);
                    newEngagedIndexes.splice(0, 0, index);
                } else {
                    newVisibleIndexes.push(index);
                    newEngagedIndexes.push(index);
                }
                isFound = true;
            } else if (this._itemIntersectsEngagedWindow(relevantDim.startBound, relevantDim.endBound)) {
                //TODO: This needs to be optimized
                if (insertOnTop) {
                    newEngagedIndexes.splice(0, 0, index);
                } else {
                    newEngagedIndexes.push(index);
                }
                isFound = true;
            }
            return isFound;
        }
    }, {
        key: "_setRelevantBounds",
        value: function _setRelevantBounds(itemRect, relevantDim) {
            if (this._isHorizontal) {
                relevantDim.endBound = itemRect.x + itemRect.width;
                relevantDim.startBound = itemRect.x;
            } else {
                relevantDim.endBound = itemRect.y + itemRect.height;
                relevantDim.startBound = itemRect.y;
            }
        }
    }, {
        key: "_isItemInBounds",
        value: function _isItemInBounds(window, itemBound) {
            return window.start <= itemBound && window.end >= itemBound;
        }
    }, {
        key: "_itemIntersectsWindow",
        value: function _itemIntersectsWindow(window, startBound, endBound) {
            return this._isItemInBounds(window, startBound) || this._isItemInBounds(window, endBound);
        }
    }, {
        key: "_itemIntersectsEngagedWindow",
        value: function _itemIntersectsEngagedWindow(startBound, endBound) {
            return this._itemIntersectsWindow(this._engagedWindow, startBound, endBound);
        }
    }, {
        key: "_itemIntersectsVisibleWindow",
        value: function _itemIntersectsVisibleWindow(startBound, endBound) {
            return this._itemIntersectsWindow(this._visibleWindow, startBound, endBound);
        }
    }, {
        key: "_updateTrackingWindows",
        value: function _updateTrackingWindows(newOffset) {
            this._engagedWindow.start = Math.max(0, newOffset - this._renderAheadOffset);
            this._engagedWindow.end = newOffset + this._windowBound + this._renderAheadOffset;

            this._visibleWindow.start = newOffset;
            this._visibleWindow.end = newOffset + this._windowBound;
        }

        //TODO:Talha optimize this

    }, {
        key: "_diffUpdateOriginalIndexesAndRaiseEvents",
        value: function _diffUpdateOriginalIndexesAndRaiseEvents(newVisibleItems, newEngagedItems) {
            this._diffArraysAndCallFunc(newVisibleItems, this._visibleIndexes, this.onVisibleRowsChanged);
            this._diffArraysAndCallFunc(newEngagedItems, this._engagedIndexes, this.onEngagedRowsChanged);
            this._visibleIndexes = newVisibleItems;
            this._engagedIndexes = newEngagedItems;
        }
    }, {
        key: "_diffArraysAndCallFunc",
        value: function _diffArraysAndCallFunc(newItems, oldItems, func) {
            if (func) {
                var now = this._calculateArrayDiff(newItems, oldItems);
                var notNow = this._calculateArrayDiff(oldItems, newItems);
                if (now.length > 0 || notNow.length > 0) {
                    func([].concat(_toConsumableArray(newItems)), now, notNow);
                }
            }
        }

        //TODO:Talha since arrays are sorted this can be much faster

    }, {
        key: "_calculateArrayDiff",
        value: function _calculateArrayDiff(arr1, arr2) {
            var len = arr1.length;
            var diffArr = [];
            for (var i = 0; i < len; i++) {
                if (_BinarySearch2.default.findIndexOf(arr2, arr1[i]) === -1) {
                    diffArr.push(arr1[i]);
                }
            }
            return diffArr;
        }
    }]);

    return ViewabilityTracker;
}();

exports.default = ViewabilityTracker;