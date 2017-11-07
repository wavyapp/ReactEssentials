'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/***
 * View renderer is responsible for creating a container of size provided by LayoutProvider and render content inside it.
 * Also enforces a logic to prevent re renders. RecyclerListView keeps moving these ViewRendereres around using transforms to enable recycling.
 * View renderer will only update if its position, dimensions or given data changes. Make sure to have a relevant shouldComponentUpdate as well.
 * This is second of the two things recycler works on. Implemented both for web and react native.
 */
var ViewRenderer = function (_React$Component) {
    _inherits(ViewRenderer, _React$Component);

    function ViewRenderer(args) {
        _classCallCheck(this, ViewRenderer);

        var _this = _possibleConstructorReturn(this, (ViewRenderer.__proto__ || Object.getPrototypeOf(ViewRenderer)).call(this, args));

        _this._dim = {};
        _this._isFirstLayoutDone = false;
        return _this;
    }

    _createClass(ViewRenderer, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._checkSizeChange();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this._checkSizeChange();
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(newProps) {
            return this.props.x !== newProps.x || this.props.y !== newProps.y || this.props.width !== newProps.width || this.props.height !== newProps.height || this.props.dataHasChanged && this.props.dataHasChanged(this.props.data, newProps.data);
        }
    }, {
        key: '_getTransform',
        value: function _getTransform() {
            return 'translate(' + this.props.x + 'px,' + this.props.y + 'px)';
        }
    }, {
        key: '_checkSizeChange',
        value: function _checkSizeChange() {
            if (this.props.forceNonDeterministicRendering && this.props.onSizeChanged) {
                var mainDiv = this.refs.mainDiv;
                if (mainDiv) {
                    this._dim.width = mainDiv.clientWidth;
                    this._dim.height = mainDiv.clientHeight;
                    if (this.props.width !== this._dim.width || this.props.height !== this._dim.height) {
                        this.props.onSizeChanged(this._dim, this.props.index);
                    } else if (!this._isFirstLayoutDone) {
                        this._isFirstLayoutDone = true;
                        this.forceUpdate();
                    }
                }
            }
            this._isFirstLayoutDone = true;
        }
    }, {
        key: 'render',
        value: function render() {
            var styleObj = this.props.forceNonDeterministicRendering ? {
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: this._isFirstLayoutDone ? 1 : 0,
                transform: this._getTransform(),
                WebkitTransform: this._getTransform()
            } : {
                position: 'absolute',
                overflow: 'hidden',
                left: 0,
                top: 0,
                width: this.props.width,
                height: this.props.height,
                transform: this._getTransform(),
                WebkitTransform: this._getTransform()
            };
            return _react2.default.createElement(
                'div',
                { ref: 'mainDiv', style: styleObj },
                this.props.childRenderer(this.props.layoutType, this.props.data, this.props.index)
            );
        }
    }]);

    return ViewRenderer;
}(_react2.default.Component);

exports.default = ViewRenderer;
//#if [DEV]
//ViewRenderer.propTypes = {
//    x: PropTypes.number.isRequired,
//    y: PropTypes.number.isRequired,
//    height: PropTypes.number.isRequired,
//    width: PropTypes.number.isRequired,
//    childRenderer: PropTypes.func.isRequired,
//    layoutType: PropTypes.any,
//    dataHasChanged: PropTypes.func,
//    onSizeChanged: PropTypes.func,
//    data: PropTypes.any,
//    index: PropTypes.number,
//    forceNonDeterministicRendering: PropTypes.bool
//};
//#endif