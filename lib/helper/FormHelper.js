'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;

var FormHelper = {};

module.exports = FormHelper;


/**
 * Return the form type of an element: Checks if the 'camunda:FormData'
 * exists in the extensions elements and returns 'form-data' when true.
 * If it does not exist, 'form-key' is returned.
 *
 * @param  {djs.model.Base} element
 *
 * @return {string} a form type (either 'form-key' or 'form-value')
 */
FormHelper.getFormType = function(element) {
  var bo = getBusinessObject(element),
      formData = getExtensionElements(bo, 'camunda:FormData'),
      formType = 'form-key';

  if (formData) {
    formType = 'form-data';
  }
  return formType;
};


/**
 * Return all form fields existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of form field objects
 */
FormHelper.getFormFields = function(element) {
  var bo = getBusinessObject(element),
      formData = getExtensionElements(bo, 'camunda:FormData');

  if (typeof formData !== 'undefined') {
    return formData[0].fields;
  } else {
    return [];
  }
};


/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
FormHelper.getFormField = function(element, idx) {

  var formFields = this.getFormFields(element);

  return formFields[idx];
};


/**
 * Get all constraints for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of constraint objects
 */
FormHelper.getConstraints = function(formField) {
  if(formField && formField.validation && formField.validation.constraints) {
    return formField.validation.constraints;
  }
  return [];
};


/**
 * Get all camunda:value objects for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of camunda:value objects
 */
FormHelper.getEnumValues = function(formField) {
  if(formField && formField.values) {
    return formField.values;
  }
  return [];
};

