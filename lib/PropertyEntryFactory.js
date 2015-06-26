'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query');

function PropertyEntryFactory() {

}

/**
 * Generates an entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * - buttonAction: Object which contains the following properties: - Object
 * ---- name: name of the [data-action] callback - String
 * ---- method: callback function for [data-action] - Function
 *
 * - buttonShow: Object which contains the following properties: - Object
 * ---- name: name of the [data-show] callback - String
 * ---- method: callback function for [data-show] - Function
 *
 * @param options
 * @returns entry object
 */
PropertyEntryFactory.singleInputField = function(options) {

  // Default action for the button next to the input-field
  var defaultButtonAction = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  var defaultButtonShow = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);

    return input.value !== '';
  };

  // default method to fetch the current value of the input field
  var defaultGet = function (element) {
    var bo = getBusinessObject(element),
      res = {};
    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  // default method to set a new value to the input field
  var defaultSet = function (element, values) {
    var res = {};
    res[options.modelProperty] = values[options.modelProperty];

    return res;
  };

  // default validation method
  var defaultValidate = function () {
    return {};
  };

  var label = ( options.label || options.id ),
      buttonLabel = ( options.buttonLabel || 'X' ),
      actionName = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.name : 'clear',
      actionMethod = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.method : defaultButtonAction,
      showName = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.name : 'canClear',
      showMethod = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.method : defaultButtonShow;

  var resource = {
    id : options.id,
    description : ( options.description || '' ),
    get : ( options.get || defaultGet ),
    set : ( options.set || defaultSet ),
    validate : ( options.validate || defaultValidate ),
    html: '<label for="camunda-' + options.id + '">'+ label +':</label>' +
            '<input id="camunda-' + options.id + '" type="text" name="' + options.modelProperty+'" />' +
            '<button data-action="' + actionName + '" data-show="' + showName + '">' + buttonLabel + '</button>'
  };

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  return resource;
};

module.exports = PropertyEntryFactory;
