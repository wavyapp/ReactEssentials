"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactNative = require("react-native");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */
var ScrollComponent = function (_React$Component) {
    _inherits(ScrollComponent, _React$Component);

    function ScrollComponent(args) {
        _classCallCheck(this, ScrollComponent);

        var _this = _possibleConstructorReturn(this, (ScrollComponent.__proto__ || Object.getPrototypeOf(ScrollComponent)).call(this, args));

        _this._onScroll = _this._onScroll.bind(_this);
        _this._onLayout = _this._onLayout.bind(_this);

        _this._height = 0;
        _this._width = 0;

        _this._isSizeChangedCalledOnce = false;
        return _this;
    }

    _createClass(ScrollComponent, [{
        key: "_onScroll",
        value: function _onScroll(event) {
            this.props.onScroll(event.nativeEvent.contentOffset.x, event.nativeEvent.contentOffset.y, event);
        }
    }, {
        key: "_onLayout",
        value: function _onLayout(event) {
            if (this._height !== event.nativeEvent.layout.height || this._width !== event.nativeEvent.layout.width) {
                this._height = event.nativeEvent.layout.height;
                this._width = event.nativeEvent.layout.width;
                if (this.props.onSizeChanged) {
                    this._isSizeChangedCalledOnce = true;
                    this.props.onSizeChanged(event.nativeEvent.layout);
                }
            }
        }
    }, {
        key: "scrollTo",
        value: function scrollTo(x, y, isAnimated) {
            this.refs["scrollView"].scrollTo({ x: x, y: y, animated: isAnimated });
        }
    }, {
        key: "render",
        value: function render() {
            var ScrollView = this.props.externalScrollView;
            return _react2.default.createElement(
                ScrollView,
                _extends({ ref: "scrollView", removeClippedSubviews: false, scrollEventThrottle: this.props.scrollThrottle
                }, this.props, {
                    horizontal: this.props.isHorizontal,
                    onScroll: this._onScroll,
                    onLayout: !this._isSizeChangedCalledOnce || this.props.canChangeSize ? this._onLayout : null }),
                _react2.default.createElement(
                    _reactNative.View,
                    { style: { flexDirection: this.props.isHorizontal ? 'row' : 'column' } },
                    _react2.default.createElement(
                        _reactNative.View,
                        { style: {
                                height: this.props.contentHeight,
                                width: this.props.contentWidth
                            } },
                        this.props.children
                    ),
                    this.props.renderFooter ? this.props.renderFooter() : null
                )
            );
        }
    }]);

    return ScrollComponent;
}(_react2.default.Component);

exports.default = ScrollComponent;

ScrollComponent.defaultProps = {
    isHorizontal: false,
    contentHeight: 0,
    contentWidth: 0,
    scrollThrottle: 16,
    externalScrollView: _reactNative.ScrollView
};
//#if [DEV]
//ScrollComponent.propTypes = {
//    contentHeight: PropTypes.number,
//    contentWidth: PropTypes.number,
//    onSizeChanged: PropTypes.func,
//    isHorizontal: PropTypes.bool,
//    renderFooter: PropTypes.func,
//    scrollThrottle: PropTypes.number,
//    canChangeSize: PropTypes.bool
//};
//#endif