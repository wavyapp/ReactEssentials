"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
 * Context provider is useful in cases where your view gets destroyed and you want to maintain scroll position when recyclerlistview is recreated e.g,
 * back navigation in android when previous fragments onDestroyView has already been called. Since recyclerlistview only renders visible items you
 * can instantly jump to any location.
 *
 * Extend this class and implement the given methods to preserve context.
 */
var ContextProvider = function () {
    function ContextProvider() {
        _classCallCheck(this, ContextProvider);
    }

    _createClass(ContextProvider, [{
        key: "getUniqueKey",

        //Should be of string type, anything which is unique in global scope of your application
        value: function getUniqueKey() {}

        //Let recycler view save a value, you can use apis like session storage/async storage here

    }, {
        key: "save",
        value: function save(key, value) {}

        //Get value for a key

    }, {
        key: "get",
        value: function get(key) {}

        //Remove key value pair

    }, {
        key: "remove",
        value: function remove(key) {}
    }]);

    return ContextProvider;
}();

exports.default = ContextProvider;