'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  cmdHelper = require('../../../helper/CmdHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  forEach = require('lodash/collection/forEach'),
  domify = require('min-dom/lib/domify'),
  
  constraint = require('./implementation/Constraint')('constraint'),
  property = require('./implementation/Property')('property');

function createFormTemplate(id) {
  return '<div class="djs-form-area" data-scope>' +
            '<button data-action="removeForm"><span>X</span></button>' +
            '<div data-list-table-head-container>' +                        

              '<div class="pp-row">' +
                '<label for="cam-form-id-'+id+'">Form ID</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-form-id-'+id+'" type="text" name="formID" />' +
                    '<button data-action="clearFormID" data-show="canClearFormID">' +
                      '<span>X</span>' +
                    '</button>' +
                  '</div>' +
              '</div>' +

              '<div class="pp-row">' +
                '<label for="cam-form-label-'+id+'">Form Label</label>' +
                '<div class="field-wrapper">' +
                  '<input id="camunda-form-label-'+id+'" type="text" name="formLabel" />' +
                  '<button data-action="clearFormLabel" data-show="canClearFormLabel">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>' +
              '</div>' +

              '<div class="pp-row">' +
                '<label for="cam-form-default-'+id+'">Form Default Value</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-form-default-'+id+'" type="text" name="formDefault" />' +
                    '<button data-action="clearFormDefault" data-show="canClearFormDefault">' +
                      '<span>X</span>' +
                    '</button>' +
                  '</div>' +
              '</div>' +

              '<div class="pp-row">' +
                '<label for="cam-form-type-'+id+'">Form Type</label>' +
                '<div class="field-wrapper">' +
                  '<select id="cam-form-type-'+id+'" name="formType" data-value>' +
                    '<option value="string">string</option>' +
                    '<option value="long">long</option>' +
                    '<option value="boolean">boolean</option>' +
                    '<option value="date">date</option>' +
                    '<option value="enum">enum</option>' +
                  '</select>' +
                '</div>' +
              '</div>' +

            '</div>'+           
            '<div data-list-table-rows-container name="constraint">' +
              constraint.template +
            '</div>'+            
            '<div data-list-table-rows-container name="property">' +
              property.template +
            '</div>'+            

         '</div>';
}

function getItem(element, bo) {
  var values = {};
  
  // read values from xml:
  values.formID = bo.get('id');
  values.formLabel = bo.get('label');
  values.formDefault = bo.get('defaultValue');
  values.formType = bo.get('type');
  
  var boValidation = bo.get('validation');
  values.constraint = [];
  if(boValidation.constraints instanceof Array && boValidation.constraints.length>0){
    for(var i=0; i<boValidation.constraints.length; i++){
      values.constraint[i] = constraint.get(element, boValidation.constraints[i]);
    }
  }

  var boProperties = bo.get('properties');
  values.property = [];
  if(boProperties.values instanceof Array && boProperties.values.length>0){
    for(var ii=0; ii<boProperties.values.length; ii++){
      values.property[ii] = property.get(element, boProperties.values[ii]);
    }
  }

  return values;
}

function createFormField(element, values, extensionElements, formFieldList, bpmnFactory) {
  // add form field values to extension elements values
  forEach(values, function(value) {
    var formField = elementHelper.createElement('camunda:FormField',
                                                     {}, extensionElements, bpmnFactory);
    formField.id = value.formID;
    formField.label = value.formLabel;
    formField.defaultValue = value.formDefault;
    formField.type = value.formType;
    
    formField.validation = elementHelper.createElement('camunda:Validation',
                                                     {constraints:[]}, formField, bpmnFactory);
    for(var i=0; i<value.constraint.length; i++){
      var constraintProps = constraint.set(element, value.constraint[i]);
      var constraintElement = elementHelper.createElement('camunda:Constraint',
                                                       constraintProps,
                                                       formField.validation, bpmnFactory);
      var constraintKeys = Object.keys(constraintProps);
      for(var key in constraintKeys){
          constraintElement[constraintKeys[key]] = constraintProps[constraintKeys[key]];
      }                                                 
      formField.validation.constraints.push(constraintElement);
    }
    
    formField.properties = elementHelper.createElement('camunda:Properties',
                                                     {values:[]}, formField, bpmnFactory);
    for(var iii=0; iii<value.property.length; iii++){
      var propertyProps = property.set(element, value.property[iii]);
      var propertyElement = elementHelper.createElement('camunda:Property',
                                                       {},formField.properties, bpmnFactory);
      var propertyKeys = Object.keys(propertyProps);
      for(var prop in propertyKeys){
          propertyElement[propertyKeys[prop]] = propertyProps[propertyKeys[prop]];
      }
      formField.properties.values.push(propertyElement);
    }
    
    formFieldList.push(formField);
  });

}

module.exports = function(group, element, bpmnFactory) {

  var bo;
  var lastIdx = 0;

  if (is(element, 'camunda:FormSupported')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'formField',
    'description': 'Configure form field.',
    'label': 'Form',
    'html': '<div class="cam-add-form">' +
              '<label for="addForm">Add Form Fields </label>' +
              '<button id="addForm" data-action="addForm"><span>+</span></button>' +
            '</div>' +
            '<div data-list-table-container></div>',

    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createFormTemplate(idx);
    },

    get: function (element, propertyName) {
      var values = [];

      if (!!bo.extensionElements) {
        var extensionElementsValues = getBusinessObject(element).extensionElements.values;
        forEach(extensionElementsValues, function(extensionElement) {
          if (typeof extensionElement.$instanceOf === 'function' &&
                  is(extensionElement, 'camunda:FormData')) {
                var extensionElementValues = extensionElement.fields;
                forEach(extensionElementValues,function(extensionSubElement){
                if (typeof extensionSubElement.$instanceOf === 'function' &&
                        is(extensionSubElement, 'camunda:FormField')) {
                  values.push(getItem(element, extensionSubElement));
                }      
            });
          }
        });
      }

      return values;
    },

    set: function (element, values, containerElement) {
      var cmd;

      var extensionElements = bo.extensionElements;
      var formData;

      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements',
                                                        { values: [] }, bo, bpmnFactory);
        formData = elementHelper.createElement('camunda:FormData',
                                                        { fields: [] }, 
                                                        extensionElements, bpmnFactory);
        createFormField(element, values, formData, formData.get('fields'), bpmnFactory);
        extensionElements.get('values').push(formData);

        cmd =  {
          extensionElements: extensionElements
        };
      }   
      else {
        var foundFormData = false;
        forEach(extensionElements.get('values'), function(extensionElement) {
          if (is(extensionElement, 'camunda:FormData')) {
            foundFormData = true;
            formData = extensionElement;
          }
        });
        if(foundFormData){
            // remove all existing form fields
            var objectsToRemove = [];
            forEach(extensionElements.get('values'), function(extensionElement) {
              if (is(extensionElement, 'camunda:FormData')) {
                forEach(extensionElement.get('fields'), function(extensionSubElement) {
                  if (is(extensionSubElement, 'camunda:FormField')) {
                    objectsToRemove.push(extensionSubElement);
                  }
                });
              }
            });

            // add all the fields
            var objectsToAdd = [];
            createFormField(element, values, formData, objectsToAdd, bpmnFactory);
            cmd = cmdHelper.addAndRemoveElementsFromList(element, formData, 'fields',
                                                      objectsToAdd, objectsToRemove);
        
        }
        else{
            formData = elementHelper.createElement('camunda:FormData',
                                                        { fields: [] }, bo, bpmnFactory);
            var extensionValues = extensionElements.get('values');
            var formDataValues = formData.get('fields');
            createFormField(element, values, formData, formDataValues, bpmnFactory);
            extensionValues.push(formData);
            cmd =  {
              extensionElements: extensionElements
            };
        }
      }

      return cmd;
    },

    validateListItem: function(element, values) {
      var validationResult = {};

      if(!values.formID) {
        validationResult.formID = "Must provide a value";
      }
      validationResult.constraint = [];
      for(var i=0; values.constraint !== undefined && i<values.constraint.length; i++){
        validationResult.constraint[i] = constraint.validate(element,
                                                   values.constraint[i]);          
      }
      validationResult.property = [];
      for(var ii=0; values.property !== undefined && ii<values.property.length; ii++){
        validationResult.property[ii] = property.validate(element,
                                                   values.property[ii]);          
      }
      return validationResult;
    },

    addForm: function(element, inputNode) {
      var formContainer = domQuery('[data-list-table-container]', inputNode);
      lastIdx++;
      var template = domify(createFormTemplate(lastIdx));
      formContainer.appendChild(template);
      return true;
    },

    removeForm: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    },

    clearFormID:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formID]', scopeNode);
      input.value = '';
      return true;
    },

    canClearFormID: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formID]', scopeNode);
      return input.value !== '';
    },

    clearFormLabel:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formLabel]', scopeNode);
      input.value = '';
      return true;
    },

    canClearFormLabel: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formLabel]', scopeNode);
      return input.value !== '';
    },

    clearFormDefault:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formDefault]', scopeNode);
      input.value = '';
      return true;
    },

    canClearFormDefault: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=formDefault]', scopeNode);
      return input.value !== '';
    },

    constraint: constraint,
    property: property,
    
    cssClasses: ['textfield']
   });

};
