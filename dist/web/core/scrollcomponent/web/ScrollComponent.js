"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _ScrollViewer = require("./ScrollViewer");

var _ScrollViewer2 = _interopRequireDefault(_ScrollViewer);

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
        _this._onSizeChanged = _this._onSizeChanged.bind(_this);

        _this._height = 0;
        _this._width = 0;
        return _this;
    }

    _createClass(ScrollComponent, [{
        key: "_onScroll",
        value: function _onScroll(e) {
            this.props.onScroll(e.offsetX, e.offsetY, e);
        }
    }, {
        key: "_onSizeChanged",
        value: function _onSizeChanged(event) {
            if (this.props.onSizeChanged) {
                this.props.onSizeChanged(event);
            }
        }
    }, {
        key: "scrollTo",
        value: function scrollTo(x, y, isAnimated) {
            this.refs["scrollView"].scrollTo(x, y, isAnimated);
        }
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _ScrollViewer2.default,
                _extends({ ref: "scrollView"
                }, this.props, {
                    horizontal: this.props.isHorizontal,
                    onScroll: this._onScroll,
                    onSizeChanged: this._onSizeChanged }),
                _react2.default.createElement(
                    "div",
                    { style: {
                            height: this.props.contentHeight,
                            width: this.props.contentWidth
                        } },
                    this.props.children
                ),
                this.props.renderFooter ? _react2.default.createElement(
                    "div",
                    { style: this.props.isHorizontal ? {
                            position: 'absolute',
                            top: 0,
                            left: this.props.contentWidth
                        } : null },
                    this.props.renderFooter()
                ) : null
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
    scrollThrottle: 0
};
//#if [DEV]
//ScrollComponent.propTypes = {
//    contentHeight: PropTypes.number,
//    contentWidth: PropTypes.number,
//    onSizeChanged: PropTypes.func,
//    isHorizontal: PropTypes.bool,
//    renderFooter: PropTypes.func,
//    scrollThrottle: PropTypes.number,
//    canChangeSize: PropTypes.bool,
//    distanceFromWindow: PropTypes.number,
//    useWindowScroll: PropTypes.bool
//};
//#endif