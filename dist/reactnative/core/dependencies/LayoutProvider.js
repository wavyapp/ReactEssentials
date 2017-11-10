"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by talha.naqvi on 05/04/17.
 * You can create a new instance or inherit and override default methods
 * You may need access to data provider here, it might make sense to pass a function which lets you fetch the latest data provider
 * Why only indexes? The answer is to allow data virtualization in the future. Since layouts are accessed much before the actual render assuming having all
 * data upfront will only limit possibilites in the future.
 *
 * By design LayoutProvider forces you to think in terms of view types. What that means is that you'll always be dealing with a finite set of view templates
 * with deterministic dimensions. We want to eliminate unnecessary re-layouts that happen when height, by mistake, is not taken into consideration.
 * This patters ensures that your scrolling is as smooth as it gets. You can always increase the number of types to handle non deterministic scenarios.
 *
 * NOTE: You can also implement features such as ListView/GridView switch by simple changing your layout provider.
 */
var LayoutProvider = function () {
    function LayoutProvider(getLayoutTypeForIndex, setLayoutForType) {
        _classCallCheck(this, LayoutProvider);

        this._getLayoutTypeForIndex = getLayoutTypeForIndex;
        this._setLayoutForType = setLayoutForType;
    }

    //Provide a type for index, something which identifies the template of view about to load


    _createClass(LayoutProvider, [{
        key: "getLayoutTypeForIndex",
        value: function getLayoutTypeForIndex(index) {
            return this._getLayoutTypeForIndex(index);
        }

        //Given a type and dimension set the dimension values on given dimension object
        //You can also get index here if you add an extra argument but we don't recommend using it.

    }, {
        key: "setLayoutForType",
        value: function setLayoutForType(type, dimension, index) {
            return this._setLayoutForType(type, dimension, index);
        }
    }]);

    return LayoutProvider;
}();

exports.default = LayoutProvider;