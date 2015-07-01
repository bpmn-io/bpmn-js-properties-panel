'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/collection/forEach');

// input entities
var textInputField = require('./factoryEntities/PropertyEntryFactoryTextInputEntity'),
    checkboxField = require('./factoryEntities/PropertyEntryFactoryCheckboxEntity'),
    referableComboboxField = require('./factoryEntities/PropertyEntryFactoryReferableComboboxEntity');

// helpers ////////////////////////////////////////

/**
 * returns the root element
 */
function getRoot(businessObject) {
  var parent = businessObject;
  while(parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}

/**
 * filters all elements in the list which have a given type.
 * removes a new list
 */
function filterElementsByType(objectList, type) {
  var list = objectList || [];
  var result = [];
  forEach(list, function(obj) {
    if(is(obj, type)) {
      result.push(obj);
    }
  });
  return result;
}

function findRootElementsByType(businessObject, referencedType) {
  var root = getRoot(businessObject);
  return filterElementsByType(root.rootElements, referencedType);
}

function removeAllChildren(domElement) {
  while(!!domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
}



/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function), validate: (*|Function), html: string}}
 */
var setDefaultParameters = function ( options ) {

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

  return {
    id : options.id,
    description : ( options.description || '' ),
    get : ( options.get || defaultGet ),
    set : ( options.set || defaultSet ),
    validate : ( options.validate || defaultValidate ),
    html: ''
  };
};

function PropertyEntryFactory() {

}

/**
 * Generates an text input entry object for a property panel.
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
 * @returns the propertyPanel entry resource object
 */
PropertyEntryFactory.textField = function(options) {
  return textInputField(options, setDefaultParameters(options));
};

/**
 * Generates a checkbox input entry object for a property panel.
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
 * @param options
 * @returns the propertyPanel entry resource object
 */
PropertyEntryFactory.checkbox = function(options) {
  return checkboxField(options, setDefaultParameters(options));
};

PropertyEntryFactory.referableCombobox = function(options) {
  return referableComboboxField(options, setDefaultParameters(options), getRoot, findRootElementsByType,
    removeAllChildren);
};

module.exports = PropertyEntryFactory;
