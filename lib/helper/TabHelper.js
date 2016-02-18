'use strict';

var TabHelper = {};

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');


/**
 * Scroll to a tab, if it is not entirely visible
 *
 * @param  {DOMElement} target link node to scroll to ('<a href=""></a>')
 */
TabHelper.scrollToTab = function(target) {
  var li = target.parentNode,
      ul = li.parentNode;

  var offsetRight = li.offsetLeft + li.offsetWidth,
      scrollLeft = ul.scrollLeft;

  if (offsetRight > ul.offsetWidth) {
    var delta = offsetRight - ul.offsetWidth;

    ul.scrollLeft = delta;
  }

  if (scrollLeft > li.offsetLeft) {
    ul.scrollLeft = 0;
  }
};


/**
 * Switch to a specific tab. This includes changing the active state of all tabs links,
 * and changing the visibility of the tabs themselves.
 *
 * @param  {DOMElement} target link node to switch to ('<a href=""></a>')
 * @param  {DOMElement} container properties panel container node
 */
TabHelper.switchToTab = function(target, container) {

  var tabLinksNode = domQuery('.djs-properties-tabs-links', container);

  // skip if the tab is already active
  if (domClasses(target).contains('pp-active')) { return; }

  var id = target.getAttribute('data-tab-target');

  // remove "active" classes
  forEach(domQuery.all('a', tabLinksNode), function (el) {
    domClasses(el.parentNode).remove('pp-active');
  });

  forEach(domQuery.all('.djs-properties-tab[data-tab]', container), function (el) {
    domClasses(el).remove('pp-active');
  });

  // add "active" classes
  domClasses(domQuery('.djs-properties-tab[data-tab="'+ id +'"]')).add('pp-active');
  domClasses(target.parentNode).add('pp-active');

  this.scrollToTab(target);
};


/**
 * This function determines the tab next to the current active tab either to
 * the left or to the right. After that it switches to that adjacent tab.
 *
 * @param  {DOMElement} target current link node ('<a href=""></a>')
 * @param  {Number} direction positive value: switch to right tab, negative value: switch to left tab (if any).
 * @param  {DOMElement} container properties panel container node
 */
TabHelper.switchToAdjacentTab = function(direction, container) {

  var tabLinksNode = domQuery('.djs-properties-tabs-links', container);

  var visibleTabNodes = filter(tabLinksNode.childNodes, function(tabNode) {
    return !domClasses(tabNode).has('pp-hidden');
  });

  var activeTabNode = domQuery('.pp-active', tabLinksNode),
      index = visibleTabNodes.indexOf(activeTabNode);

  var newIndex = index + Math.sign(direction);

  if (newIndex < 0 || newIndex >= visibleTabNodes.length) {
    return;
  }

  var newTabNode = visibleTabNodes[newIndex];

  this.switchToTab(newTabNode.firstChild, container);
};

module.exports = TabHelper;