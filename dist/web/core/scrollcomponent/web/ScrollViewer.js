"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _throttle2 = require("lodash/throttle");

var _throttle3 = _interopRequireDefault(_throttle2);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/***
 * A scrollviewer that mimics react native scrollview. Additionally on web it can start listening to window scroll events optionally.
 * Supports both window scroll and scrollable divs inside other divs.
 */
var ScrollViewer = function (_React$Component) {
    _inherits(ScrollViewer, _React$Component);

    function ScrollViewer(args) {
        _classCallCheck(this, ScrollViewer);

        var _this = _possibleConstructorReturn(this, (ScrollViewer.__proto__ || Object.getPrototypeOf(ScrollViewer)).call(this, args));

        _this._onScroll = _this._onScroll.bind(_this);
        _this._windowOnScroll = _this._windowOnScroll.bind(_this);
        _this._getRelevantOffset = _this._getRelevantOffset.bind(_this);
        _this._setRelevantOffset = _this._setRelevantOffset.bind(_this);
        _this._onWindowResize = _this._onWindowResize.bind(_this);

        _this.scrollEvent = { offsetX: 0, offsetY: 0 };
        _this._throttleParams = { leading: true, trailing: true };
        return _this;
    }

    _createClass(ScrollViewer, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            if (this.props.onSizeChanged) {
                if (!this.props.useWindowScroll) {
                    var divRef = this.refs.mainDiv;
                    this._startListeningToDivEvents();
                    this.props.onSizeChanged({ height: divRef.clientHeight, width: divRef.clientWidth });
                }
            }
        }
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {
            if (this.props.onSizeChanged) {
                if (this.props.useWindowScroll) {
                    this._startListeningToWindowEvents();
                    this.props.onSizeChanged({ height: window.innerHeight, width: window.innerWidth });
                }
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._throttleFunction) {
                window.removeEventListener("scroll", this._throttleFunction);
                if (this.refs.mainDiv) {
                    this.refs.mainDiv.removeEventListener("scroll", this._onScroll);
                }
            }
            window.removeEventListener("resize", this._onWindowResize);
        }
    }, {
        key: "scrollTo",
        value: function scrollTo(x, y, isAnimated) {
            if (isAnimated) {
                this._doAnimatedScroll(this.props.isHorizontal ? x : y);
            } else {
                this._setRelevantOffset(this.props.isHorizontal ? x : y);
            }
        }
    }, {
        key: "_getRelevantOffset",
        value: function _getRelevantOffset() {
            if (!this.props.useWindowScroll) {
                if (this.props.isHorizontal) {
                    return this.refs.mainDiv.scrollLeft;
                } else {
                    return this.refs.mainDiv.scrollTop;
                }
            } else {
                if (this.props.isHorizontal) {
                    return window.scrollX;
                } else {
                    return window.scrollY;
                }
            }
        }
    }, {
        key: "_setRelevantOffset",
        value: function _setRelevantOffset(offset) {
            if (!this.props.useWindowScroll) {
                if (this.props.isHorizontal) {
                    this.refs.mainDiv.scrollLeft = offset;
                } else {
                    this.refs.mainDiv.scrollTop = offset;
                }
            } else {
                if (this.props.isHorizontal) {
                    window.scrollTo(offset + this.props.distanceFromWindow, 0);
                } else {
                    window.scrollTo(0, offset + this.props.distanceFromWindow);
                }
            }
        }
    }, {
        key: "_doAnimatedScroll",
        value: function _doAnimatedScroll(offset) {
            var _this2 = this;

            var start = this._getRelevantOffset();
            if (offset > start) {
                start = Math.max(offset - 800, start);
            } else {
                start = Math.min(offset + 800, start);
            }
            var change = offset - start;
            var increment = 20;
            var duration = 200;
            var animateScroll = function animateScroll(elapsedTime) {
                elapsedTime += increment;
                var position = _this2._easeInOut(elapsedTime, start, change, duration);
                _this2._setRelevantOffset(position);
                if (elapsedTime < duration) {
                    window.setTimeout(function () {
                        animateScroll(elapsedTime);
                    }, increment);
                }
            };
            animateScroll(0);
        }
    }, {
        key: "_startListeningToDivEvents",
        value: function _startListeningToDivEvents() {
            if (this.props.scrollThrottle > 0) {
                this._throttleFunction = (0, _throttle3.default)(this._onScroll, this.props.scrollThrottle, this._throttleParams);
            } else {
                this._throttleFunction = this._onScroll;
            }
            this.refs.mainDiv.addEventListener("scroll", this._throttleFunction);
        }
    }, {
        key: "_startListeningToWindowEvents",
        value: function _startListeningToWindowEvents() {
            if (this.props.scrollThrottle > 0) {
                this._throttleFunction = (0, _throttle3.default)(this._windowOnScroll, this.props.scrollThrottle, this._throttleParams);
            } else {
                this._throttleFunction = this._windowOnScroll;
            }
            window.addEventListener("scroll", this._throttleFunction);
            if (this.props.canChangeSize) {
                window.addEventListener("resize", this._onWindowResize);
            }
        }
    }, {
        key: "_onWindowResize",
        value: function _onWindowResize() {
            if (this.props.onSizeChanged && this.props.useWindowScroll) {
                this.props.onSizeChanged({ height: window.innerHeight, width: window.innerWidth });
            }
        }
    }, {
        key: "_windowOnScroll",
        value: function _windowOnScroll() {
            if (this.props.onScroll) {
                if (this.props.horizontal) {
                    this.scrollEvent.offsetY = 0;
                    this.scrollEvent.offsetX = window.scrollX - this.props.distanceFromWindow;
                } else {
                    this.scrollEvent.offsetX = 0;
                    this.scrollEvent.offsetY = window.scrollY - this.props.distanceFromWindow;
                }
                this.props.onScroll(this.scrollEvent);
            }
        }
    }, {
        key: "_onScroll",
        value: function _onScroll() {
            if (this.props.onScroll) {
                if (this.props.horizontal) {
                    this.scrollEvent.offsetY = 0;
                    this.scrollEvent.offsetX = this.refs.mainDiv.scrollLeft;
                } else {
                    this.scrollEvent.offsetX = 0;
                    this.scrollEvent.offsetY = this.refs.mainDiv.scrollTop;
                }
                this.props.onScroll(this.scrollEvent);
            }
        }
    }, {
        key: "_easeInOut",
        value: function _easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
            }
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        }
    }, {
        key: "render",
        value: function render() {
            return !this.props.useWindowScroll ? _react2.default.createElement(
                "div",
                {
                    ref: "mainDiv",
                    style: _extends({
                        WebkitOverflowScrolling: "touch",
                        overflowX: this.props.horizontal ? "scroll" : "hidden",
                        overflowY: !this.props.horizontal ? "scroll" : "hidden",
                        height: "100%",
                        width: "100%"
                    }, this.props.style)
                },
                _react2.default.createElement(
                    "div",
                    { style: { position: "relative" } },
                    this.props.children
                )
            ) : _react2.default.createElement(
                "div",
                { style: { position: "relative" } },
                this.props.children
            );
        }
    }]);

    return ScrollViewer;
}(_react2.default.Component);

exports.default = ScrollViewer;

ScrollViewer.defaultProps = {
    scrollThrottle: 0,
    canChangeSize: false,
    useWindowScroll: false,
    distanceFromWindow: 0
};
//#if [DEV]
//ScrollViewer.propTypes = {
//    onScroll: PropTypes.func,
//    onSizeChanged: PropTypes.func,
//    horizontal: PropTypes.bool,
//    scrollThrottle: PropTypes.number,
//    canChangeSize: PropTypes.bool,
//    useWindowScroll: PropTypes.bool,
//    distanceFromWindow: PropTypes.number
//};
//#endif