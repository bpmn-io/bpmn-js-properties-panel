'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;

var domClosest = require('min-dom/lib/closest'),
    domQuery = require('min-dom/lib/query'),
    find = require('lodash/collection/find');

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
 * Get a form field from the business object by id
 *
 * @param {djs.model.Base} element
 * @param {string} id
 *
 * @return {ModdleElement} the form field
 */
FormHelper.getFormField = function(element, id) {

  var formFields = this.getFormFields(element);

  return find(formFields, function(field) { return field.id === id; });
};


/**
 * Return the currently selected form field querying the form field select box
 * from the DOM.
 *
 * @param  {djs.model.Base} element
 * @param  {DOMElement} node - DOM element of any form field text input
 *
 * @return {ModdleElement} the currently selected form field
 */
FormHelper.getSelectedFormField = function(element, node) {

  var formsGroup = domClosest(node, '[data-group="forms"]'),
      formFieldsNode = domQuery('#cam-extension-elements-form-fields', formsGroup),
      selectedIdx = formFieldsNode.options.selectedIndex;

  if (selectedIdx === -1) {
    return;
  }

  var formFieldId = formFieldsNode.options[selectedIdx].text;

  return this.getFormField(element, formFieldId);
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
