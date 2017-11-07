"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _VirtualRenderer = require("./VirtualRenderer");

var _VirtualRenderer2 = _interopRequireDefault(_VirtualRenderer);

var _DataProvider = require("./dependencies/DataProvider");

var _DataProvider2 = _interopRequireDefault(_DataProvider);

var _LayoutProvider = require("./dependencies/LayoutProvider");

var _LayoutProvider2 = _interopRequireDefault(_LayoutProvider);

var _LayoutManager = require("./layoutmanager/LayoutManager");

var _LayoutManager2 = _interopRequireDefault(_LayoutManager);

var _RecyclerListViewExceptions = require("./exceptions/RecyclerListViewExceptions");

var _RecyclerListViewExceptions2 = _interopRequireDefault(_RecyclerListViewExceptions);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _ContextProvider = require("./dependencies/ContextProvider");

var _ContextProvider2 = _interopRequireDefault(_ContextProvider);

var _CustomError = require("./exceptions/CustomError");

var _CustomError2 = _interopRequireDefault(_CustomError);

var _Messages = require("./messages/Messages");

var _Messages2 = _interopRequireDefault(_Messages);

var _debounce2 = require("lodash/debounce");

var _debounce3 = _interopRequireDefault(_debounce2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /***
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Reduce layout processing on data insert
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Add notify data set changed and notify data insert option in data source
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Add on end reached callback
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Make another class for render stack generator
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Simplify rendering a loading footer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Anchor first visible index on any insert/delete data wise
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Build Scroll to index
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Give viewability callbacks
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Add full render logic in cases like change of dimensions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Fix all proptypes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * DONE: Add Initial render Index support
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Destroy less frequently used items in recycle pool, this will help in case of too many types.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Add animated scroll to web scrollviewer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Animate list view transition, including add/remove
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Implement sticky headers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Make viewability callbacks configurable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * TODO: Observe size changes on web to optimize for reflowability
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ScrollComponent = void 0,
    ViewRenderer = void 0;

var refreshRequestDebouncer = (0, _debounce3.default)(function (executable) {
    executable();
});

/***
 * Using webpack plugin definitions to choose the scroll component and view renderer
 * To run in browser specify an extra plugin RLV_ENV: JSON.stringify('browser')
 * Alternatively, you can start importing from recyclerlistview/web
 */
//#if [REACT-NATIVE]
if (process.env.RLV_ENV && process.env.RLV_ENV === 'browser') {
    platform = "web";
    ScrollComponent = require("./scrollcomponent/web/ScrollComponent").default;
    ViewRenderer = require("./viewrenderer/web/ViewRenderer").default;
} else {
    ScrollComponent = require("./scrollcomponent/reactnative/ScrollComponent").default;
    ViewRenderer = require("./viewrenderer/reactnative/ViewRenderer").default;
}
//#endif

//#if [WEB]
// ScrollComponent = require("./scrollcomponent/web/ScrollComponent").default;
// ViewRenderer = require("./viewrenderer/web/ViewRenderer").default;
//#endif

/***
 * This is the main component, please refer to samples to understand how to use.
 * For advanced usage check out prop descriptions below.
 * You also get common methods such as: scrollToIndex, scrollToItem, scrollToTop, scrollToEnd, scrollToOffset, getCurrentScrollOffset, findApproxFirstVisibleIndex
 * You'll need a ref to Recycler in order to call these
 * Needs to have bounded size in all cases other than window scrolling (web).
 *
 * NOTE: React Native implementation uses ScrollView internally which means you get all ScrollView features as well such as Pull To Refresh, paging enabled
 *       You can easily create a recycling image flip view using one paging enabled flag. Read about ScrollView features in official react native documentation.
 * NOTE: If you see blank space look at the renderAheadOffset prop and make sure your data provider has a good enough rowHasChanged method.
 *       Blanks are totally avoidable with this listview.
 * NOTE: Also works on web (experimental)
 * NOTE: For reflowability set canChangeSize to true (experimental)
 */

var RecyclerListView = function (_Component) {
    _inherits(RecyclerListView, _Component);

    function RecyclerListView(props) {
        _classCallCheck(this, RecyclerListView);

        var _this = _possibleConstructorReturn(this, (RecyclerListView.__proto__ || Object.getPrototypeOf(RecyclerListView)).call(this, props));

        _this._onScroll = _this._onScroll.bind(_this);
        _this._onSizeChanged = _this._onSizeChanged.bind(_this);
        _this._onVisibleItemsChanged = _this._onVisibleItemsChanged.bind(_this);
        _this._dataHasChanged = _this._dataHasChanged.bind(_this);
        _this.scrollToOffset = _this.scrollToOffset.bind(_this);
        _this._renderStackWhenReady = _this._renderStackWhenReady.bind(_this);
        _this._onViewContainerSizeChange = _this._onViewContainerSizeChange.bind(_this);
        _this._onEndReachedCalled = false;

        _this._virtualRenderer = new _VirtualRenderer2.default(_this._renderStackWhenReady, function (offset) {
            _this._pendingScrollToOffset = offset;
        }, !props.disableRecycling);

        _this._initComplete = false;
        _this._relayoutReqIndex = -1;
        _this._params = {};
        _this._layout = { height: 0, width: 0 };
        _this._pendingScrollToOffset = null;
        _this._tempDim = {};
        _this._initialOffset = 0;
        _this._cachedLayouts = null;
        _this.state = {
            renderStack: []
        };
        return _this;
    }

    _createClass(RecyclerListView, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(newProps) {
            if (!this._initComplete) {
                this._initComplete = true;
                this._initTrackers();
                this._processOnEndReached();
                this._checkAndChangeLayouts(this.props);
            }
            this._assertDependencyPresence(newProps);
            this._checkAndChangeLayouts(newProps, true);
            if (!this.props.onVisibleIndexesChanged) {
                this._virtualRenderer.removeVisibleItemsListener();
            } else {
                this._virtualRenderer.attachVisibleItemsListener(this._onVisibleItemsChanged);
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var _this2 = this;

            if (this._pendingScrollToOffset) {
                var offset = this._pendingScrollToOffset;
                this._pendingScrollToOffset = null;
                if (this.props.isHorizontal) {
                    offset.y = 0;
                } else {
                    offset.x = 0;
                }
                setTimeout(function () {
                    _this2.scrollToOffset(offset.x, offset.y, false);
                }, 0);
            }
            this._processOnEndReached();
            this._checkAndChangeLayouts(this.props);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this.props.contextProvider) {
                var uniqueKey = this.props.contextProvider.getUniqueKey();
                if (uniqueKey) {
                    this.props.contextProvider.save(uniqueKey, this.getCurrentScrollOffset());
                    if (this.props.forceNonDeterministicRendering) {
                        if (this._virtualRenderer) {
                            var layoutsToCache = this._virtualRenderer.getLayoutManager().getLayouts();
                            if (layoutsToCache) {
                                layoutsToCache = JSON.stringify({ layoutArray: layoutsToCache });
                                this.props.contextProvider.save(uniqueKey + "_layouts", layoutsToCache);
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {
            if (this.props.contextProvider) {
                var uniqueKey = this.props.contextProvider.getUniqueKey();
                if (uniqueKey) {
                    var offset = this.props.contextProvider.get(uniqueKey);
                    if (offset > 0) {
                        this._initialOffset = offset;
                    }
                    if (this.props.forceNonDeterministicRendering) {
                        var cachedLayouts = this.props.contextProvider.get(uniqueKey + "_layouts");
                        if (cachedLayouts) {
                            cachedLayouts = JSON.parse(cachedLayouts)["layoutArray"];
                            this._cachedLayouts = cachedLayouts;
                        }
                    }
                    this.props.contextProvider.remove(uniqueKey);
                }
            }
        }
    }, {
        key: "scrollToIndex",
        value: function scrollToIndex(index, animate) {
            if (this._virtualRenderer.getLayoutManager()) {
                var offsets = this._virtualRenderer.getLayoutManager().getOffsetForIndex(index);
                this.scrollToOffset(offsets.x, offsets.y, animate);
            } else {
                console.warn(_Messages2.default.WARN_SCROLL_TO_INDEX);
            }
        }
    }, {
        key: "scrollToItem",
        value: function scrollToItem(data, animate) {
            var count = this.props.dataProvider.getSize();
            for (var i = 0; i < count; i++) {
                if (this.props.dataProvider.getDataForIndex(i) === data) {
                    this.scrollToIndex(i, animate);
                    break;
                }
            }
        }
    }, {
        key: "scrollToTop",
        value: function scrollToTop(animate) {
            this.scrollToOffset(0, 0, animate);
        }
    }, {
        key: "scrollToEnd",
        value: function scrollToEnd(animate) {
            var lastIndex = this.props.dataProvider.getSize() - 1;
            this.scrollToIndex(lastIndex, animate);
        }
    }, {
        key: "scrollToOffset",
        value: function scrollToOffset(x, y) {
            var animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var scrollComponent = this.refs["scrollComponent"];
            if (scrollComponent) {
                scrollComponent.scrollTo(x, y, animate);
            }
        }
    }, {
        key: "getCurrentScrollOffset",
        value: function getCurrentScrollOffset() {
            var viewabilityTracker = this._virtualRenderer.getViewabilityTracker();
            return viewabilityTracker ? viewabilityTracker.getLastOffset() : 0;
        }
    }, {
        key: "findApproxFirstVisibleIndex",
        value: function findApproxFirstVisibleIndex() {
            var viewabilityTracker = this._virtualRenderer.getViewabilityTracker();
            return viewabilityTracker ? viewabilityTracker.findFirstLogicallyVisibleIndex() : 0;
        }
    }, {
        key: "_checkAndChangeLayouts",
        value: function _checkAndChangeLayouts(newProps, forceFullRender) {
            var _this3 = this;

            try {
                this._params.isHorizontal = newProps.isHorizontal;
                this._params.itemCount = newProps.dataProvider.getSize();
                this._virtualRenderer.setParamsAndDimensions(this._params, this._layout);
                if (forceFullRender || this.props.layoutProvider !== newProps.layoutProvider || this.props.isHorizontal !== newProps.isHorizontal) {
                    //TODO:Talha use old layout manager
                    console.log('Layout manager set');
                    this._virtualRenderer.setLayoutManager(new _LayoutManager2.default(newProps.layoutProvider, this._layout, newProps.isHorizontal));
                    setTimeout(function () {
                        _this3._virtualRenderer.refreshWithAnchor();
                    }, 500);
                } else if (this.props.dataProvider !== newProps.dataProvider) {
                    console.log('get layout called');
                    if (this._virtualRenderer.getLayoutManager()) {
                        this._virtualRenderer.getLayoutMxanager().reLayoutFromIndex(newProps.dataProvider._firstIndexToProcess, newProps.dataProvider.getSize());
                        this._virtualRenderer.refresh();
                    }
                } else if (this._relayoutReqIndex >= 0) {
                    debugger;
                    console.log('get layout called 2');
                    if (this._virtualRenderer.getLayoutManager()) {
                        this._virtualRenderer.getLayoutManager().reLayoutFromIndex(this._relayoutReqIndex, newProps.dataProvider.getSize());
                        this._relayoutReqIndex = -1;
                        this._refreshViewability();
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
    }, {
        key: "_refreshViewability",
        value: function _refreshViewability() {
            this._virtualRenderer.refresh();
            this._queueStateRefresh();
        }
    }, {
        key: "_queueStateRefresh",
        value: function _queueStateRefresh() {
            var _this4 = this;

            refreshRequestDebouncer(function () {
                _this4.setState(function (prevState) {
                    return prevState;
                });
            });
        }
    }, {
        key: "_onSizeChanged",
        value: function _onSizeChanged(layout) {
            var hasHeightChanged = this._layout.height !== layout.height;
            var hasWidthChanged = this._layout.width !== layout.width;
            this._layout.height = layout.height;
            this._layout.width = layout.width;
            if (layout.height === 0 || layout.width === 0) {
                throw new _CustomError2.default(_RecyclerListViewExceptions2.default.layoutException);
            }
            if (!this._initComplete) {
                this._initComplete = true;
                this._initTrackers();
                this._processOnEndReached();
                this._checkAndChangeLayouts(this.props, true);
            } else {
                if (hasHeightChanged && hasWidthChanged || hasHeightChanged && this.props.isHorizontal || hasWidthChanged && !this.props.isHorizontal) {
                    this._checkAndChangeLayouts(this.props, true);
                } else {
                    this._refreshViewability();
                }
            }
        }
    }, {
        key: "_renderStackWhenReady",
        value: function _renderStackWhenReady(stack) {
            this.setState(function () {
                return { renderStack: stack };
            });
        }
    }, {
        key: "_initTrackers",
        value: function _initTrackers() {
            this._assertDependencyPresence(this.props);
            if (this.props.onVisibleIndexesChanged) {
                this._virtualRenderer.attachVisibleItemsListener(this._onVisibleItemsChanged);
            }
            this._params = {
                isHorizontal: this.props.isHorizontal,
                itemCount: this.props.dataProvider.getSize(),
                initialOffset: this.props.initialOffset ? this.props.initialOffset : this._initialOffset,
                renderAheadOffset: this.props.renderAheadOffset,
                initialRenderIndex: this.props.initialRenderIndex
            };
            this._virtualRenderer.setParamsAndDimensions(this._params, this._layout);
            this._virtualRenderer.setLayoutManager(new _LayoutManager2.default(this.props.layoutProvider, this._layout, this.props.isHorizontal, this._cachedLayouts));
            this._virtualRenderer.setLayoutProvider(this.props.layoutProvider);
            this._virtualRenderer.init();
            var offset = this._virtualRenderer.getInitialOffset();
            if (offset.y > 0 || offset.x > 0) {
                this._pendingScrollToOffset = offset;
                this.setState({});
            } else {
                this._virtualRenderer.startViewabilityTracker();
            }
            this._cachedLayouts = null;
        }
    }, {
        key: "_onVisibleItemsChanged",
        value: function _onVisibleItemsChanged(all, now, notNow) {
            this.props.onVisibleIndexesChanged(all, now, notNow);
        }
    }, {
        key: "_assertDependencyPresence",
        value: function _assertDependencyPresence(props) {
            if (!props.dataProvider || !props.layoutProvider) {
                throw new _CustomError2.default(_RecyclerListViewExceptions2.default.unresolvedDependenciesException);
            }
        }
    }, {
        key: "_assertType",
        value: function _assertType(type) {
            if (!type && type !== 0) {
                throw new _CustomError2.default(_RecyclerListViewExceptions2.default.itemTypeNullException);
            }
        }
    }, {
        key: "_dataHasChanged",
        value: function _dataHasChanged(row1, row2) {
            return this.props.dataProvider.rowHasChanged(row1, row2);
        }
    }, {
        key: "_renderRowUsingMeta",
        value: function _renderRowUsingMeta(itemMeta) {
            var dataSize = this.props.dataProvider.getSize();
            var dataIndex = itemMeta.dataIndex;
            if (dataIndex < dataSize) {
                var itemRect = this._virtualRenderer.getLayoutManager().getLayouts()[dataIndex];
                var data = this.props.dataProvider.getDataForIndex(dataIndex);
                var type = this.props.layoutProvider.getLayoutTypeForIndex(dataIndex);
                this._assertType(type);
                if (!this.props.forceNonDeterministicRendering) {
                    this._checkExpectedDimensionDiscrepancy(itemRect, type, dataIndex);
                }
                return _react2.default.createElement(ViewRenderer, { key: itemMeta.key, data: data,
                    dataHasChanged: this._dataHasChanged,
                    x: itemRect.x,
                    y: itemRect.y,
                    layoutType: type,
                    index: dataIndex,
                    forceNonDeterministicRendering: this.props.forceNonDeterministicRendering,
                    isHorizontal: this.props.isHorizontal,
                    onSizeChanged: this._onViewContainerSizeChange,
                    childRenderer: this.props.rowRenderer,
                    height: itemRect.height,
                    width: itemRect.width });
            }
            return null;
        }
    }, {
        key: "_onViewContainerSizeChange",
        value: function _onViewContainerSizeChange(dim, index) {
            this._virtualRenderer.getLayoutManager().overrideLayout(index, dim);
            if (this._relayoutReqIndex === -1) {
                this._relayoutReqIndex = index;
            } else {
                this._relayoutReqIndex = Math.min(this._relayoutReqIndex, index);
            }
            this._queueStateRefresh();
        }
    }, {
        key: "_checkExpectedDimensionDiscrepancy",
        value: function _checkExpectedDimensionDiscrepancy(itemRect, type, index) {
            this._virtualRenderer.getLayoutManager()._setMaxBounds(this._tempDim);
            this.props.layoutProvider.setLayoutForType(type, this._tempDim, index);

            //TODO:Talha calling private method, find an alternative and remove this
            this._virtualRenderer.getLayoutManager()._setMaxBounds(this._tempDim);
            if (itemRect.height !== this._tempDim.height || itemRect.width !== this._tempDim.width) {
                if (this._relayoutReqIndex === -1) {
                    this._relayoutReqIndex = index;
                } else {
                    this._relayoutReqIndex = Math.min(this._relayoutReqIndex, index);
                }
            }
        }
    }, {
        key: "_generateRenderStack",
        value: function _generateRenderStack() {
            var renderedItems = [];
            for (var key in this.state.renderStack) {
                if (this.state.renderStack.hasOwnProperty(key)) {
                    renderedItems.push(this._renderRowUsingMeta(this.state.renderStack[key]));
                }
            }
            return renderedItems;
        }
    }, {
        key: "_onScroll",
        value: function _onScroll(offsetX, offsetY, rawEvent) {
            this._virtualRenderer.updateOffset(offsetX, offsetY);
            if (this.props.onScroll) {
                this.props.onScroll(rawEvent, offsetX, offsetY);
            }
            this._processOnEndReached();
        }
    }, {
        key: "_processOnEndReached",
        value: function _processOnEndReached() {
            try {
                if (this.props.onEndReached && this._virtualRenderer) {
                    var layout = this._virtualRenderer.getLayoutDimension();
                    var windowBound = this.props.isHorizontal ? layout.width - this._layout.width : layout.height - this._layout.height;
                    if (windowBound - this._virtualRenderer.getViewabilityTracker().getLastOffset() <= this.props.onEndReachedThreshold) {
                        if (!this._onEndReachedCalled) {
                            this._onEndReachedCalled = true;
                            this.props.onEndReached();
                        }
                    } else {
                        this._onEndReachedCalled = false;
                    }
                }
            } catch (err) {
                //TODO: Talha: find something to do
                console.log(err);
            }
        }
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                ScrollComponent,
                _extends({ ref: "scrollComponent"
                }, this.props, {
                    onScroll: this._onScroll,
                    onSizeChanged: this._onSizeChanged,
                    contentHeight: this._initComplete ? this._virtualRenderer.getLayoutDimension().height : null,
                    contentWidth: this._initComplete ? this._virtualRenderer.getLayoutDimension().width : null }),
                this._generateRenderStack()
            );
        }
    }]);

    return RecyclerListView;
}(_react.Component);

exports.default = RecyclerListView;


RecyclerListView.defaultProps = {
    initialOffset: 0,
    isHorizontal: false,
    renderAheadOffset: 250,
    onEndReachedThreshold: 0,
    initialRenderIndex: 0,
    canChangeSize: false,
    disableRecycling: false
};

RecyclerListView.propTypes = {

    //Refer the sample
    layoutProvider: _propTypes2.default.instanceOf(_LayoutProvider2.default).isRequired,

    //Refer the sample
    dataProvider: _propTypes2.default.instanceOf(_DataProvider2.default).isRequired,

    //Used to maintain scroll position in case view gets destroyed e.g, cases of back navigation
    contextProvider: _propTypes2.default.instanceOf(_ContextProvider2.default),

    //Methods which returns react component to be rendered. You get type of view and data in the callback.
    rowRenderer: _propTypes2.default.func.isRequired,

    //Initial offset you want to start rendering from, very useful if you want to maintain scroll context across pages.
    initialOffset: _propTypes2.default.number,

    //Specify how many pixels in advance do you want views to be rendered. Increasing this value can help reduce blanks (if any). However keeping this as low
    //as possible should be the intent. Higher values also increase re-render compute
    renderAheadOffset: _propTypes2.default.number,

    //Whether the listview is horizontally scrollable. Both use staggeredGrid implementation
    isHorizontal: _propTypes2.default.bool,

    //On scroll callback onScroll(rawEvent, offsetX, offsetY), note you get offsets no need to read scrollTop/scrollLeft
    onScroll: _propTypes2.default.func,

    //Callback given when user scrolls to the end of the list or footer just becomes visible, useful in incremental loading scenarios
    onEndReached: _propTypes2.default.func,

    //Specify how many pixels in advance you onEndReached callback
    onEndReachedThreshold: _propTypes2.default.number,

    //Provides visible index, helpful in sending impression events etc, onVisibleIndexesChanged(all, now, notNow)
    onVisibleIndexesChanged: _propTypes2.default.func,

    //Provide this method if you want to render a footer. Helpful in showing a loader while doing incremental loads.
    renderFooter: _propTypes2.default.func,

    //Specify the initial item index you want rendering to start from. Preferred over initialOffset if both are specified.
    initialRenderIndex: _propTypes2.default.number,

    //web/iOS only. Scroll throttle duration.
    scrollThrottle: _propTypes2.default.number,

    //Specify if size can change, listview will automatically relayout items. For web, works only with useWindowScroll = true
    canChangeSize: _propTypes2.default.bool,

    //Web only. Specify how far away the first list item is from window top. This is an adjustment for better optimization.
    distanceFromWindow: _propTypes2.default.number,

    //Web only. Layout elements in window instead of a scrollable div.
    useWindowScroll: _propTypes2.default.bool,

    //Turns off recycling. You still get progressive rendering and all other features. Good for lazy rendering. This should not be used in most cases.
    disableRecycling: _propTypes2.default.bool,

    //Default is false, if enabled dimensions provided in layout provider will not be strictly enforced. Rendered dimensions will be used to relayout items. Slower if enabled.
    forceNonDeterministicRendering: _propTypes2.default.bool
};