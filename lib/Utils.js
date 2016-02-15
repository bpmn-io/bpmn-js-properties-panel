'use strict';

var domQuery = require('min-dom/lib/query'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/collection/forEach'),
    domify = require('min-dom/lib/domify'),
    Ids = require('ids');

var Utils = {};
module.exports = Utils;

var SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
var QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

Utils.selectedOption = function(selectBox) {
  if(selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
};

Utils.selectedType = function(elementSyntax, inputNode) {
  var typeSelect = domQuery(elementSyntax, inputNode);
  return this.selectedOption(typeSelect);
};

/**
 * returns the root element
 */
Utils.getRoot = function(businessObject) {
  var parent = businessObject;
  while(parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
};

/**
 * filters all elements in the list which have a given type.
 * removes a new list
 */
Utils.filterElementsByType = function(objectList, type) {
  var list = objectList || [];
  var result = [];
  forEach(list, function(obj) {
    if(is(obj, type)) {
      result.push(obj);
    }
  });
  return result;
};

Utils.findRootElementsByType = function(businessObject, referencedType) {
  var root = this.getRoot(businessObject);
  return this.filterElementsByType(root.rootElements, referencedType);
};

Utils.removeAllChildren = function(domElement) {
  while(!!domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
};

/**
 * adds an empty option to the list
 */
Utils.addEmptyParameter = function(list) {
  return list.push({'label': '', 'value': '', 'name': ''});
};

/**
 * returns a list with all root elements for the given parameter 'referencedType'
 */
Utils.refreshOptionsModel = function(businessObject, referencedType) {
  var model = [];
  var referableObjects = this.findRootElementsByType(businessObject, referencedType);
  forEach(referableObjects, function(obj) {
    model.push({
      label: obj.name + ' (id='+obj.id+')',
      value: obj.id,
      name: obj.name
    });
  });
  return model;
};

/**
 * fills the drop down with options
 */
Utils.updateOptionsDropDown = function(domSelector, businessObject, referencedType, entryNode) {
  var options = this.refreshOptionsModel(businessObject, referencedType);
  this.addEmptyParameter(options);
  var selectBox = domQuery(domSelector, entryNode);
  this.removeAllChildren(selectBox);
  forEach(options, function(option){
    var optionEntry = domify('<option value="' + option.value + '">' + option.label + '</option>');
    selectBox.appendChild(optionEntry);
  });
  return options;
};

/**
  * checks whether the id value is valid
  */
Utils.isIdValid = function(bo, idValue) {
  var assigned = bo.$model.ids.assigned(idValue);

  var idExists = !!assigned && assigned !== bo;

  if (!idValue || idExists) {
    return 'Element must have an unique id.';
  }
  
  return this.validateId(idValue);
};

Utils.validateId = function(idValue) {

  if (this.containsSpace(idValue)) {
    return 'Id must not contain spaces.';
  }

  if (!QNAME_REGEX.test(idValue)) {
    return 'Id must be a valid QName.';
  }
};

Utils.containsSpace = function(value) {
  return SPACE_REGEX.test(value);
};

/**
  * generate a semantic id with given prefix
  */
Utils.nextId = function(prefix) {
  var ids = new Ids([32,32,1]);

  return ids.nextPrefixed(prefix);
};
