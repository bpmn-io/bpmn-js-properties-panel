'use strict';

var TestHelper = module.exports = require('bpmn-js/test/helper');

TestHelper.insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));
TestHelper.insertCSS('bpmn-embedded.css', require('bpmn-js/assets/bpmn-font/css/bpmn-embedded.css'));
TestHelper.insertCSS('properties.css', require('../assets/properties.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: 500px; }' + '.bjs-container { height: 70% !important; }' + '.test-container > div'
);

/**
 * Triggers an change event
 * @param element on which the change should be triggered
 * @param eventType type of the event (e.g. click, change, ...)
 */
var triggerEvent = function(element, eventType) {
  element.dispatchEvent(new MouseEvent(eventType, {
    view: window,
    bubbles: true
  }));
};

var triggerValue = function(element, value, eventType) {
  element.value = value;
  this.triggerEvent(element, eventType);
};

module.exports.triggerEvent = triggerEvent;
module.exports.triggerValue = triggerValue;
