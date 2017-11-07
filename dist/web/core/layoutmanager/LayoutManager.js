"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /***
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Computes the positions and dimensions of items that will be rendered by the list. The output from this is utilized by viewability tracker to compute the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * lists of visible/hidden item.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Note: In future, this will also become an external dependency which means you can write your own layout manager. That will enable everyone to layout their
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * views just the way they want. Current implementation is a StaggeredList
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _CustomError = require("../exceptions/CustomError");

var _CustomError2 = _interopRequireDefault(_CustomError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LayoutManager = function () {
    function LayoutManager(layoutProvider, dimensions, isHorizontal, cachedLayouts) {
        _classCallCheck(this, LayoutManager);

        this._layoutProvider = layoutProvider;
        this._window = dimensions;
        this._totalHeight = 0;
        this._totalWidth = 0;
        this._layouts = cachedLayouts || [];
        this._isHorizontal = isHorizontal;
    }

    _createClass(LayoutManager, [{
        key: "getLayoutDimension",
        value: function getLayoutDimension() {
            return { height: this._totalHeight, width: this._totalWidth };
        }
    }, {
        key: "getLayouts",
        value: function getLayouts() {
            return this._layouts;
        }
    }, {
        key: "getOffsetForIndex",
        value: function getOffsetForIndex(index) {
            if (this._layouts.length > index) {
                return { x: this._layouts[index].x, y: this._layouts[index].y };
            } else {
                throw new _CustomError2.default({
                    type: "LayoutUnavailableException",
                    message: "No layout available for index: " + index
                });
            }
        }
    }, {
        key: "overrideLayout",
        value: function overrideLayout(index, dim) {
            var layout = this._layouts[index];
            if (layout) {
                layout.isOverridden = true;
                layout.width = dim.width;
                layout.height = dim.height;
            }
        }

        //TODO:Talha laziliy calculate in future revisions

    }, {
        key: "reLayoutFromIndex",
        value: function reLayoutFromIndex(startIndex, itemCount) {
            console.log('reLayoutFromIndex called');
            startIndex = this._locateFirstNeighbourIndex(startIndex);
            var startX = 0;
            var startY = 0;
            var maxBound = 0;

            var startVal = this._layouts[startIndex];

            if (startVal) {
                startX = startVal.x;
                startY = startVal.y;
                this._pointDimensionsToRect(startVal);
            }

            var oldItemCount = this._layouts.length;

            var itemDim = { height: 0, width: 0 };
            var itemRect = null;

            var oldLayout = null;

            for (var i = startIndex; i < itemCount; i++) {
                oldLayout = this._layouts[i];
                if (oldLayout && oldLayout.isOverridden) {
                    itemDim.height = oldLayout.height;
                    itemDim.width = oldLayout.width;
                } else {
                    this._layoutProvider.setLayoutForType(this._layoutProvider.getLayoutTypeForIndex(i), itemDim, i);
                }
                this._setMaxBounds(itemDim);
                while (!this._checkBounds(startX, startY, itemDim, this._isHorizontal)) {
                    if (this._isHorizontal) {
                        startX += maxBound;
                        startY = 0;
                        this._totalWidth += maxBound;
                    } else {
                        startX = 0;
                        startY += maxBound;
                        this._totalHeight += maxBound;
                    }
                    maxBound = 0;
                }

                maxBound = this._isHorizontal ? Math.max(maxBound, itemDim.width) : Math.max(maxBound, itemDim.height);

                //TODO: Talha creating array upfront will speed this up
                if (i > oldItemCount - 1) {
                    this._layouts.push({ x: startX, y: startY, height: itemDim.height, width: itemDim.width });
                } else {
                    itemRect = this._layouts[i];
                    itemRect.x = startX;
                    itemRect.y = startY;
                    itemRect.width = itemDim.width;
                    itemRect.height = itemDim.height;
                }

                if (this._isHorizontal) {
                    startY += itemDim.height;
                } else {
                    startX += itemDim.width;
                }
            }
            if (oldItemCount > itemCount) {
                this._layouts.splice(itemCount, oldItemCount - itemCount);
            }
            this._setFinalDimensions(maxBound);
            console.log('reLayoutFromIndex completed');
            console.log('this.layouts: ');
            console.log(this._layouts);
        }
    }, {
        key: "_pointDimensionsToRect",
        value: function _pointDimensionsToRect(itemRect) {
            if (this._isHorizontal) {
                this._totalWidth = itemRect.x;
            } else {
                this._totalHeight = itemRect.y;
            }
        }
    }, {
        key: "_setFinalDimensions",
        value: function _setFinalDimensions(maxBound) {
            if (this._isHorizontal) {
                this._totalHeight = this._window.height;
                this._totalWidth += maxBound;
            } else {
                this._totalWidth = this._window.width;
                this._totalHeight += maxBound;
            }
        }
    }, {
        key: "_locateFirstNeighbourIndex",
        value: function _locateFirstNeighbourIndex(startIndex) {
            if (startIndex === 0) {
                return 0;
            }
            var i = startIndex - 1;
            for (; i >= 0; i--) {
                if (this._isHorizontal) {
                    if (this._layouts[i].y === 0) {
                        break;
                    }
                } else if (this._layouts[i].x === 0) {
                    break;
                }
            }
            return i;
        }
    }, {
        key: "_setMaxBounds",
        value: function _setMaxBounds(itemDim) {
            if (this._isHorizontal) {
                itemDim.height = Math.min(this._window.height, itemDim.height);
            } else {
                itemDim.width = Math.min(this._window.width, itemDim.width);
            }
        }
    }, {
        key: "_checkBounds",
        value: function _checkBounds(itemX, itemY, itemDim, isHorizontal) {
            return isHorizontal ? itemY + itemDim.height <= this._window.height : itemX + itemDim.width <= this._window.width;
        }
    }]);

    return LayoutManager;
}();

exports.default = LayoutManager;