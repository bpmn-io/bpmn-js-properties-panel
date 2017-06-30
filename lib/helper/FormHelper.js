'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;

var FormHelper = {};

module.exports = FormHelper;

/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} formData
 */
FormHelper.getFormData = function(element) {
  var bo = getBusinessObject(element);

  var formData = getExtensionElements(bo, 'camunda:FormData');

  if (typeof formData !== 'undefined') {
    return formData[0];
  }
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
  var formData = this.getFormData(element);

  if (typeof formData === 'undefined') {
    return [];
  }

  return formData.fields;
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
  if (formField && formField.validation && formField.validation.constraints) {
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
  if (formField && formField.values) {
    return formField.values;
  }
  return [];
};

