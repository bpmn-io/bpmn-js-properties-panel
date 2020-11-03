'use strict';

var TestHelper = module.exports = require('./helper');

var domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domAttr = require('min-dom').attr;


TestHelper.insertCSS('diagram-js.css', require('bpmn-js/dist/assets/diagram-js.css'));
TestHelper.insertCSS('bpmn-embedded.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));
TestHelper.insertCSS('properties.css', require('./assets/properties.css'));

TestHelper.insertCSS('diagram-js-testing.css',
  '.test-container .result { height: auto; }' +
  '.bpp-container { height: 400px !important; }' +
  ' div.test-container {height: auto}'
);


var bootstrapModeler = TestHelper.bootstrapModeler;

/**
 * Bootstrap a modeler instance.
 *
 * Before a modeler instance is bootstrapped any previous
 * existing modeler instance is destroyed, if it exists.
 *
 * Due to the fact that (almost) each test case bootstrap a new
 * modeler instance, destroying of an previous modeler instance
 * is necessary to speed the test execution up.
 */
TestHelper.bootstrapModeler = function(diagram, options, locals) {
  return function() {
    var previousInstance = TestHelper.getBpmnJS();

    if (previousInstance) {
      var container = previousInstance._container.parentNode;

      container.parentNode.removeChild(container);

      previousInstance.destroy();
    }
    return bootstrapModeler(diagram, options, locals).apply(this);
  };
};

/**
 * Overwrites the existing global bootstrapModeler().
 */
global.bootstrapModeler = TestHelper.bootstrapModeler;

/**
 * Triggers a change event
 *
 * @param element on which the change should be triggered
 * @param eventType type of the event (e.g. click, change, ...)
 */
var triggerEvent = function(element, eventType) {

  var evt;

  eventType = eventType || 'change';

  try {

    // Chrome, Safari, Firefox
    evt = new MouseEvent((eventType), {
      view: window,
      bubbles: true,
      cancelable: true
    });
  } catch (e) {

    // IE 11, PhantomJS (wat!)
    evt = document.createEvent('MouseEvent');

    evt.initEvent((eventType), true, true);
  }

  return element.dispatchEvent(evt);
};

/**
 * Set the new value to the given element.
 *
 * @param element on which the change should be triggered
 * @param value new value for the element
 * @param eventType (optional) type of the event (e.g. click, change, ...)
 * @param cursorPosition (optional) position ot the cursor after changing
 *                                  the value
 */
var triggerValue = function(element, value, eventType, cursorPosition) {
  if (typeof eventType == 'number') {
    cursorPosition = eventType;
    eventType = null;
  }

  element.focus();

  if (domAttr(element, 'contenteditable')) {
    element.innerText = value;
  } else {
    element.value = value;
  }

  if (cursorPosition) {

    if (domAttr(element, 'contenteditable')) {
      setCaretPosition(element.childNodes[0], cursorPosition);
    } else {
      element.selectionStart = cursorPosition;
      element.selectionEnd = cursorPosition;
    }
  }

  this.triggerEvent(element, eventType);
};

var triggerInput = function(element, value) {
  element.value = value;

  this.triggerEvent(element, 'input');

  element.focus();
};

var triggerKeyEvent = function(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  element.dispatchEvent(e);
};


/**
 * Select a form field with the specified index in the DOM
 *
 * @param  {number} index
 * @param  {DOMElement} container
 */
var triggerFormFieldSelection = function(index, container) {
  var formFieldSelectBox = domQuery(
    'select[name=selectedExtensionElement]',
    container
  );

  formFieldSelectBox.options[index].selected = 'selected';
  TestHelper.triggerEvent(formFieldSelectBox, 'change');
};

/**
 *  Select the option with the given value
 *
 *  @param element contains the options
 *  @param optionValue value which should be selected
 */
var selectedByOption = function(element, optionValue) {

  var options = domQueryAll('option', element);

  for (var i = 0; i< options.length; i++) {

    var option = options[i];

    if (option.value === optionValue) {
      element.selectedIndex = i;
      break;
    }
  }
};

/**
 * PhantomJS Speciality
 * @param element
 * @returns {*}
 */
var selectedByIndex = function(element) {
  if (!element) {
    return null;
  }

  return element.options[element.selectedIndex];
};

var setCaretPosition = function(element, position) {
  var range = document.createRange(),
      selection = window.getSelection();

  range.setStart(element, position);
  range.setEnd(element, position);

  selection.removeAllRanges();

  selection.addRange(range);
};


module.exports.triggerEvent = triggerEvent;
module.exports.triggerValue = triggerValue;
module.exports.triggerInput = triggerInput;
module.exports.triggerKeyEvent = triggerKeyEvent;
module.exports.triggerFormFieldSelection = triggerFormFieldSelection;
module.exports.selectedByOption = selectedByOption;
module.exports.selectedByIndex = selectedByIndex;
module.exports.setCaretPosition = setCaretPosition;


global.chai.use(require('./matchers'));
