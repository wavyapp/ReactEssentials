/* @flow */
/* eslint-disable import/no-commonjs */

module.exports = {
    get TabViewAnimated() {
        return require('./src/tabview/TabViewAnimated').default;
    },
    get TabViewPagerPan() {
        return require('./src/tabview/TabViewPagerPan').default;
    },
    get TabViewPagerScroll() {
        return require('./src/tabview/TabViewPagerScroll').default;
    },
    get TabViewPagerAndroid() {
        return require('./src/tabview/TabViewPagerAndroid').default;
    },
    get TabBar() {
        return require('./src/tabview/TabBar').default;
    },
    get SceneMap() {
        return require('./src/tabview/SceneMap').default;
    },
};
