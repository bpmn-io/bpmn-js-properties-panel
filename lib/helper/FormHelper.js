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
 * Return the currently selected form field querying the form field select box
 * from the DOM.
 *
 * @param  {djs.model.Base} element
 * @param  {DOMElement} node - DOM element of any form field text input
 *
 * @return {ModdleElement} the currently selected form field
 */
FormHelper.getSelectedFormField = function(element, node, formFieldSelectBox) {
  var selection = formFieldSelectBox.getSelected(element, node.parentNode),
      formFields = this.getFormFields(getBusinessObject(element));

  if (selection.idx > -1) {
    return formFields[selection.idx];
  }
};
