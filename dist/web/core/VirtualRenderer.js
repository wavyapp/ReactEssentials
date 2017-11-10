"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ViewabilityTracker = require("./ViewabilityTracker");

var _ViewabilityTracker2 = _interopRequireDefault(_ViewabilityTracker);

var _RecycleItemPool = require("../utils/RecycleItemPool");

var _RecycleItemPool2 = _interopRequireDefault(_RecycleItemPool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
 * Renderer which keeps track of recyclable items and the currently rendered items. Notifies list view to re render if something changes, like scroll offset
 */
var VirtualRenderer = function () {
    function VirtualRenderer(renderStackChanged, scrollOnNextUpdate, isRecyclingEnabled) {
        _classCallCheck(this, VirtualRenderer);

        //Keeps track of items that need to be rendered in the next render cycle
        this._renderStack = {};

        //Keeps track of keys of all the currently rendered indexes, can eventually replace renderStack as well if no new use cases come up
        this._renderStackIndexKeyMap = {};
        this._renderStackChanged = renderStackChanged;
        this._scrollOnNextUpdate = scrollOnNextUpdate;
        this._dimensions = null;
        this._params = null;
        this._isRecyclingEnabled = isRecyclingEnabled;

        this._isViewTrackerRunning = false;

        //Would be surprised if someone exceeds this
        this._startKey = 0;

        this.onVisibleItemsChanged = null;
        this._onEngagedItemsChanged = this._onEngagedItemsChanged.bind(this);
        this._onVisibleItemsChanged = this._onVisibleItemsChanged.bind(this);
    }

    _createClass(VirtualRenderer, [{
        key: "getLayoutDimension",
        value: function getLayoutDimension() {
            return this._layoutManager.getLayoutDimension();
        }
    }, {
        key: "updateOffset",
        value: function updateOffset(offsetX, offsetY) {
            if (!this._isViewTrackerRunning) {
                this.startViewabilityTracker();
            }
            if (this._params.isHorizontal) {
                this._viewabilityTracker.updateOffset(offsetX);
            } else {
                this._viewabilityTracker.updateOffset(offsetY);
            }
        }
    }, {
        key: "attachVisibleItemsListener",
        value: function attachVisibleItemsListener(callback) {
            this.onVisibleItemsChanged = callback;
        }
    }, {
        key: "removeVisibleItemsListener",
        value: function removeVisibleItemsListener() {
            this.onVisibleItemsChanged = null;

            if (this._viewabilityTracker) {
                this._viewabilityTracker.onVisibleRowsChanged = null;
            }
        }
    }, {
        key: "getLayoutManager",
        value: function getLayoutManager() {
            return this._layoutManager;
        }
    }, {
        key: "setParamsAndDimensions",
        value: function setParamsAndDimensions(params, dim) {
            this._params = params;
            this._dimensions = dim;
        }
    }, {
        key: "setLayoutManager",
        value: function setLayoutManager(layoutManager) {
            this._layoutManager = layoutManager;
            this._layoutManager.reLayoutFromIndex(0, this._params.itemCount);
        }
    }, {
        key: "setLayoutProvider",
        value: function setLayoutProvider(layoutProvider) {
            this._layoutProvider = layoutProvider;
        }
    }, {
        key: "getViewabilityTracker",
        value: function getViewabilityTracker() {
            return this._viewabilityTracker;
        }
    }, {
        key: "refreshWithAnchor",
        value: function refreshWithAnchor() {
            var firstVisibleIndex = this._viewabilityTracker.findFirstLogicallyVisibleIndex();
            this._prepareViewabilityTracker();
            var offset = 0;
            try {
                offset = this._layoutManager.getOffsetForIndex(firstVisibleIndex);
                this._scrollOnNextUpdate(offset);
                offset = this._params.isHorizontal ? offset.x : offset.y;
            } catch (e) {}
            this._viewabilityTracker.forceRefreshWithOffset(offset);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            if (this._viewabilityTracker) {
                this._prepareViewabilityTracker();
                if (this._viewabilityTracker.forceRefresh()) {
                    if (this._params.isHorizontal) {
                        this._scrollOnNextUpdate({ x: this._viewabilityTracker.getLastOffset(), y: 0 });
                    } else {
                        this._scrollOnNextUpdate({ x: 0, y: this._viewabilityTracker.getLastOffset() });
                    }
                }
            }
        }
    }, {
        key: "getInitialOffset",
        value: function getInitialOffset() {
            var offset = void 0;
            if (this._params.initialRenderIndex > 0) {
                offset = this._layoutManager.getOffsetForIndex(this._params.initialRenderIndex);
                this._params.initialOffset = this._params.isHorizontal ? offset.x : offset.y;
            } else {
                offset = {};
                if (this._params.isHorizontal) {
                    offset.x = this._params.initialOffset;
                    offset.y = 0;
                } else {
                    offset.y = this._params.initialOffset;
                    offset.x = 0;
                }
            }
            return offset;
        }
    }, {
        key: "init",
        value: function init() {
            this._recyclePool = new _RecycleItemPool2.default();
            this._viewabilityTracker = new _ViewabilityTracker2.default(this._params.renderAheadOffset, this._params.initialOffset);
            this._prepareViewabilityTracker();
        }
    }, {
        key: "startViewabilityTracker",
        value: function startViewabilityTracker() {
            this._isViewTrackerRunning = true;
            this._viewabilityTracker.init();
        }
    }, {
        key: "_getNewKey",
        value: function _getNewKey() {
            return this._startKey++;
        }
    }, {
        key: "_prepareViewabilityTracker",
        value: function _prepareViewabilityTracker() {
            this._viewabilityTracker.onEngagedRowsChanged = this._onEngagedItemsChanged;
            if (this.onVisibleItemsChanged) {
                this._viewabilityTracker.onVisibleRowsChanged = this._onVisibleItemsChanged;
            }
            this._viewabilityTracker.setLayouts(this._layoutManager.getLayouts(), this._params.isHorizontal ? this._layoutManager.getLayoutDimension().width : this._layoutManager.getLayoutDimension().height);
            this._viewabilityTracker.setDimensions({
                height: this._dimensions.height,
                width: this._dimensions.width
            }, this._params.isHorizontal);
        }
    }, {
        key: "_onVisibleItemsChanged",
        value: function _onVisibleItemsChanged(all, now, notNow) {
            if (this.onVisibleItemsChanged) {
                this.onVisibleItemsChanged(all, now, notNow);
            }
        }
    }, {
        key: "_onEngagedItemsChanged",
        value: function _onEngagedItemsChanged(all, now, notNow) {
            var count = notNow.length;
            var resolvedIndex = 0;
            var disengagedIndex = 0;
            if (this._isRecyclingEnabled) {
                for (var i = 0; i < count; i++) {
                    disengagedIndex = notNow[i];
                    resolvedIndex = this._renderStackIndexKeyMap[disengagedIndex];

                    if (disengagedIndex < this._params.itemCount) {
                        //All the items which are now not visible can go to the recycle pool, the pool only needs to maintain keys since
                        //react can link a view to a key automatically
                        this._recyclePool.putRecycledObject(this._layoutProvider.getLayoutTypeForIndex(disengagedIndex), resolvedIndex);
                    } else {
                        //Type provider may not be available in this case, use most probable
                        var itemMeta = this._renderStack[resolvedIndex];
                        this._recyclePool.putRecycledObject(itemMeta.type, resolvedIndex);
                    }
                }
            }
            if (this._updateRenderStack(now)) {
                //Ask Recycler View to update itself
                this._renderStackChanged(this._renderStack);
            }
        }

        //Updates render stack and reports whether anything has changed

    }, {
        key: "_updateRenderStack",
        value: function _updateRenderStack(itemIndexes) {
            var count = itemIndexes.length;
            var type = null;
            var availableKey = null;
            var itemMeta = null;
            var index = 0;
            var hasRenderStackChanged = false;
            for (var i = 0; i < count; i++) {
                index = itemIndexes[i];
                availableKey = this._renderStackIndexKeyMap[index];
                if (availableKey >= 0) {
                    //Use if already rendered and remove from pool
                    this._recyclePool.removeFromPool(availableKey);
                    itemMeta = this._renderStack[availableKey];
                    if (itemMeta.key !== availableKey) {
                        hasRenderStackChanged = true;
                        itemMeta.key = availableKey;
                    }
                } else {
                    hasRenderStackChanged = true;
                    type = this._layoutProvider.getLayoutTypeForIndex(index);
                    availableKey = this._recyclePool.getRecycledObject(type);
                    if (availableKey) {
                        //If available in pool use that key instead
                        //Recylepool works with string types so we need this conversion
                        availableKey = parseInt(availableKey, 10);
                        itemMeta = this._renderStack[availableKey];
                        if (!itemMeta) {
                            itemMeta = {};
                            this._renderStack[availableKey] = itemMeta;
                        }
                        itemMeta.key = availableKey;
                        itemMeta.type = type;

                        //since this data index is no longer being rendered anywhere
                        delete this._renderStackIndexKeyMap[itemMeta.dataIndex];
                    } else {
                        //Create new if no existing key is available
                        itemMeta = {};
                        availableKey = this._getNewKey();
                        itemMeta.key = availableKey;
                        itemMeta.type = type;
                        this._renderStack[availableKey] = itemMeta;
                    }

                    //TODO:Talha validate if this causes an issue
                    //In case of mismatch in pool types we need to make sure only unique data indexes exist in render stack
                    //keys are always integers for all practical purposes
                    // alreadyRenderedAtKey = this._renderStackIndexKeyMap[index];
                    // if (alreadyRenderedAtKey >= 0) {
                    //     this._recyclePool.removeFromPool(alreadyRenderedAtKey);
                    //     delete this._renderStack[alreadyRenderedAtKey];
                    // }
                }
                this._renderStackIndexKeyMap[index] = itemMeta.key;
                itemMeta.dataIndex = index;
            }
            return hasRenderStackChanged;
        }
    }]);

    return VirtualRenderer;
}();

exports.default = VirtualRenderer;