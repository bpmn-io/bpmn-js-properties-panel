'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements,
    extensionElements = require('./implementation/ExtensionElements'),
    entryFactory = require('../../../factory/EntryFactory'),
    elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    formHelper = require('../../../helper/FormHelper'),
    utils = require('../../../Utils'),
    is = require('bpmn-js/lib/util/ModelUtil').is;

var formFieldSelectBox;

/**
 * Generate a form field specific textField using entryFactory.
 *
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {string} options.modelProperty
 * @param  {function} options.validate
 *
 * @return {Object} an entryFactory.textField object
 */
function formFieldTextField(options) {

  var id = options.id,
      label = options.label,
      modelProperty = options.modelProperty,
      validate = options.validate;

  return entryFactory.textField({
    id: id,
    label: label,
    modelProperty: modelProperty,
    get: function(element, node) {
      var selectedFormField = formHelper.getSelectedFormField(element, node, formFieldSelectBox) || {},
          values = {};

      values[modelProperty] = selectedFormField[modelProperty];

      return values;
    },

    set: function(element, values, node) {
      var formField = formHelper.getSelectedFormField(element, node, formFieldSelectBox),
          properties = {};

      properties[modelProperty] = values[modelProperty];

      return cmdHelper.updateBusinessObject(element, formField, properties);
    },

    disabled: function(element, node) {
      return formHelper.getFormType(element) === 'form-key' ||
             !formHelper.getSelectedFormField(element, node, formFieldSelectBox);
    },
    validate: validate
  });
}

function ensureFormKeyAndDataSupported(element) {
  return (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess')) ||
         is(element, 'bpmn:UserTask');
}

module.exports = function(group, element, bpmnFactory) {

  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }

  // form type select box
  group.entries.push({
    id: 'form-type',
    html: '<div class="pp-row">' +
            '<label for="camunda-form-type">Form Type</label>' +
            '<div class="pp-field-wrapper">' +
              '<select id="camunda-form-type" name="formType" data-value>' +
                '<option value="form-key">Form Key</option>' +
                '<option value="form-data">Form Data</option>' +
              '</select>' +
            '</div>' +
          '</div>',
    get: function(element, node) {
      return {
        formType: formHelper.getFormType(element)
      };
    },
    set: function(element, values, node) {

      var bo = getBusinessObject(element);

      if (values.formType === 'form-key') {
        // Form Key is selected in the select box
        var entry = getExtensionElements(bo, 'camunda:FormData');

        return cmdHelper.removeElementsFromList(element, bo.extensionElements, 'values', 'extensionElements', entry);
      } else {
        // Form Data is selected in the select box
        var commands = [];

        commands.push(cmdHelper.updateBusinessObject(element, bo, { 'camunda:formKey': undefined }));

        var extensionElements = bo.get('extensionElements');
        var existsExtensionElements = true;
        if (!extensionElements) {
          existsExtensionElements = false;
          extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        }

        var formData = elementHelper.createElement('camunda:FormData', { fields: [] }, extensionElements, bpmnFactory);

        if (existsExtensionElements) {
          commands.push(cmdHelper.addElementsTolist(element, bo, 'values', 'extensionElements',
            [ formData ], []));
        } else {
          extensionElements.values.push(formData);
          commands.push(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }));
        }

        return commands;
      }
    }
  });

  // [FormKey] form key text input field
  group.entries.push(entryFactory.textField({
    id : 'form-key',
    label : 'Form Key',
    modelProperty: 'formKey',
    get: function(element, node) {
      var bo = getBusinessObject(element);

      return {
        formKey: bo.get('camunda:formKey')
      };
    },
    set: function(element, values, node) {
      var bo = getBusinessObject(element),
          formKey = values.formKey || undefined;

      return cmdHelper.updateBusinessObject(element, bo, { 'camunda:formKey': formKey });
    },
    disabled: function(element, node) {
      return formHelper.getFormType(element) === 'form-data';
    }
  }));

  // [FormData] form field select box
  formFieldSelectBox = extensionElements(element, bpmnFactory, {
    id : 'form-fields',
    label : 'Form Fields',
    modelProperty: 'id',
    prefix: 'FormField',
    createExtensionElement: function(element, extensionElements, value){
      var bo = getBusinessObject(element),
          formData = getExtensionElements(bo, 'camunda:FormData')[0],
          field = elementHelper.createElement('camunda:FormField', { id: value }, formData, bpmnFactory);

      if (typeof formData.fields !== 'undefined') {
        return cmdHelper.addElementsTolist(element, formData, 'fields', [ field ]);
      } else {
        return cmdHelper.updateBusinessObject(element, formData, {
          fields: [ field ]
        });
      }
    },
    getExtensionElements: function(bo) {
      return formHelper.getFormFields(bo);
    },
    disabled: function(element, node) {
      return formHelper.getFormType(element) === 'form-key';
    }
  });
  group.entries.push(formFieldSelectBox);

  // [FormData] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'form-field-id',
    label: 'ID',
    modelProperty: 'id',

    getProperty: function(element, node) {
      var selectedFormField = formHelper.getSelectedFormField(element, node, formFieldSelectBox) || {};

      return selectedFormField.id;
    },

    setProperty: function(element, properties, node) {
      var formField = formHelper.getSelectedFormField(element, node, formFieldSelectBox);

      return cmdHelper.updateBusinessObject(element, formField, properties);
    },
    disabled: function(element, node) {
      return formHelper.getFormType(element) === 'form-key' ||
             !formHelper.getSelectedFormField(element, node, formFieldSelectBox);
    },
    validate: function(element, values, node) {

      var formField = formHelper.getSelectedFormField(element, node, formFieldSelectBox);

      var idError;

      if (formField) {
        var idValue = values.id || this.__lastInvalidId;

        idError = utils.isIdValid(formField, idValue);
      }

      return idError ? { id: idError } : {};
    }
  }));

  // [FormData] form field type text input field
  group.entries.push(formFieldTextField({
    id : 'form-field-type',
    label : 'Type',
    modelProperty: 'type'
  }));

  // [FormData] form field label text input field
  group.entries.push(formFieldTextField({
    id : 'form-field-label',
    label : 'Label',
    modelProperty: 'label'
  }));

  // [FormData] form field defaultValue text input field
  group.entries.push(formFieldTextField({
    id : 'form-field-defaultValue',
    label : 'Default Value',
    modelProperty: 'defaultValue'
  }));
};