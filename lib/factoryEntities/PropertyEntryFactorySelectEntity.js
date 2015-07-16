'use strict';

var forEach = require('lodash/collection/forEach'),
    reduce = require('lodash/object/transform'),
    domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var isList = function(list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function(list) {
  return list.concat([{ name: '', value: '' }]);
};

var selectbox = function(options, defaultParameters) {
  var resource = defaultParameters,
    label = options.label || resource.id,
    selectOptions = (isList(options.selectOptions)) ? addEmptyParameter(options.selectOptions) : [ { name: '', value: '' }],
    modelProperty = options.modelProperty;

  resource.html =
    '<label for="camunda-' + resource.id + '">' + label + '</label>' +
    '<select id="camunda-' + resource.id + '" name="' + options.modelProperty + '">';

  forEach(selectOptions, function(option){
    resource.html += '<option value="' + option.value + '">' + option.name + '</option>';
  });

  resource.html += '</select>';

  resource.get = function(element, propertyName) {
    var businessObject = getBusinessObject(element),
        boValue = businessObject.get(modelProperty) || '',
        elementFields = domQuery.all('select#camunda-' + resource.id + ' > option', propertyName);

    forEach(elementFields, function(field) {
      if(field.value === boValue) {
        domAttr(field, 'selected', 'selected');
      } else {
        domAttr(field, 'selected', null);
      }
    });
  };

  resource.cssClasses = ['dropdown'];

  return resource;
};

module.exports = selectbox;
