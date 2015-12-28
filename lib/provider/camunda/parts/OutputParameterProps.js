'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  cmdHelper = require('../../../helper/CmdHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  forEach = require('lodash/collection/forEach'),
  domify = require('min-dom/lib/domify'),
  utils = require('../../../Utils'),

  script = require('./implementation/Script')('scriptFormat', 'value', true),
  map = require('./implementation/Entry')('map'),
  list = require('./implementation/InputOutputParameter')('list');

function createParameterTemplate(id) {
  return '<div class="djs-parameter-area" data-scope>' +
            '<button data-action="removeOutputParameter"><span>X</span></button>' +
            '<div data-list-table-head-container>' +            

              '<div class="pp-row">' +
                '<label for="cam-parameter-name-'+id+'">Parameter Name</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="cam-parameter-name-'+id+'" type="text" name="parameterName" />' +
                    '<button data-action="clearParameterName" data-show="canClearParameterName">' +
                      '<span>X</span>' +
                    '</button>' +
                  '</div>' +
              '</div>' +

              '<div class="pp-row">' +
                '<label for="cam-parameter-type-'+id+'">Parameter Type</label>' +
                '<div class="field-wrapper">' +
                  '<select id="cam-parameter-type-'+id+'" name="parameterType" data-value>' +
                    '<option value="text">Text</option>' +
                    '<option value="map">Map</option>' +
                    '<option value="list">List</option>' +
                    '<option value="script">Script</option>' +
                  '</select>' +
                '</div>' +
              '</div>' +

              '<div class="pp-row" data-show="isText">' +
                  '<label for="cam-parameter-val-'+id+'">Value</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="cam-parameter-val-'+id+'" type="text" name="parameterValue" />' +
                    '<button data-action="clearParameterValue" data-show="canClearParameterValue">' +
                      '<span>X</span>' +
                    '</button>' +
                  '</div>' +
              '</div>' +

              '<div data-show="isScript">' +
                script.template +
              '</div>'+
                
            '</div>'+           
            '<div data-list-table-rows-container data-show="isMap" name="map">' +
              map.template +
            '</div>'+            
            '<div data-list-table-rows-container data-show="isList" name="list">' +
              list.template +
            '</div>'+            

          '</div>';
}

function getItem(element, bo) {    
  // read values from xml:
  var boText = bo.get('value');
  var boDefinition = bo.definition;

  var values = {};
  if(!!boText){
      values.parameterType = 'text';
      values.parameterValue = boText;
  } else if(!!boDefinition) {
      if(boDefinition.entries!==undefined){
          values.parameterType = 'map';
          values.map = [];
          if(boDefinition.entries instanceof Array && boDefinition.entries.length>0){
              for(var i=0; i<boDefinition.entries.length; i++){
                  values.map[i] = map.get(element, boDefinition.entries[i]);
              }
          }
      } else if(boDefinition.items!==undefined){
          values.parameterType = 'list';
          values.list = [];
          if(boDefinition.items instanceof Array && boDefinition.items.length>0){
            for(var ii=0; ii<boDefinition.items.length; ii++){
                values.list[ii] = list.get(element, boDefinition.items[ii]);
            }
          }            
      } else {
          values = script.get(element, boDefinition);
          values.parameterType = 'script';  
      }
  } else {
      values.parameterType = 'text';  
      values.parameterValue = '';
  }  
  values.parameterName = bo.get('name');
  return values;
}

function createOutputParameter(element, values, extensionElements, outputParameterList, bpmnFactory) {
  // add output parameter values to extension elements values
  forEach(values, function(value) { 
    var outputParameter = elementHelper.createElement('camunda:OutputParameter',
                                                     {}, extensionElements, bpmnFactory);
    outputParameter.name = value.parameterName;
    if (value.parameterType === 'script') {
      var scriptProps = script.set(element, value);
      outputParameter.definition = elementHelper.createElement('camunda:Script',
                                                     scriptProps, outputParameter, bpmnFactory);
    }
    else if (value.parameterType === 'text') {
      outputParameter.value = value.parameterValue;
    } 
    else if (value.parameterType === 'map') {
      outputParameter.definition = elementHelper.createElement('camunda:Map',
                                                     {entries:[]}, outputParameter, bpmnFactory);
      for(var i=0; i<value.map.length; i++){
        var mapProps = map.set(element, value.map[i]);
        var mapElement = elementHelper.createElement('camunda:Entry',
                                                         {},outputParameter.definition, bpmnFactory);
        var mapKeys = Object.keys(mapProps);
        for(var mapProp in mapKeys){
            mapElement[mapKeys[mapProp]] = mapProps[mapKeys[mapProp]];
        }
        outputParameter.definition.entries.push(mapElement);
      }
    }
    else if (value.parameterType === 'list') {
      outputParameter.definition = elementHelper.createElement('camunda:List',
                                                     {items:[]}, outputParameter, bpmnFactory);
      for(var ii=0; ii<value.list.length; ii++){
        var listProps = list.set(element, value.list[ii]);
        var listElement = elementHelper.createElement('camunda:Value',
                                                         {},outputParameter.definition, bpmnFactory);
        var listKeys = Object.keys(listProps);
        for(var listProp in listKeys){
            listElement[listKeys[listProp]] = listProps[listKeys[listProp]];
        }
        outputParameter.definition.items.push(listElement);
      }      
    }
    outputParameterList.push(outputParameter);
  });

}

module.exports = function(group, element, bpmnFactory) {

  var bo;
  var lastIdx = 0;

  if (is(element, 'camunda:OutputParameterSupported')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'outputParameters',
    'description': 'Configure output parameter.',
    'label': 'Parameter',
    'html': '<div class="cam-add-parameter">' +
              '<label for="addOutputParameter">Add Output Parameter </label>' +
              '<button id="addOutputParameter" data-action="addOutputParameter"><span>+</span></button>' +
            '</div>' +
            '<div data-list-table-container></div>',

    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createParameterTemplate(idx);
    },
        
    get: function (element, propertyName) {
      var values = [];

      if (!!bo.extensionElements) {
        var extensionElementsValues = getBusinessObject(element).extensionElements.values;
        forEach(extensionElementsValues, function(extensionElement) {
          if (typeof extensionElement.$instanceOf === 'function' && is(extensionElement, 'camunda:InputOutput')) {
                var extensionElementValues = extensionElement.outputParameters;
                forEach(extensionElementValues,function(extensionSubElement){
                if (typeof extensionSubElement.$instanceOf === 'function' &&
                        is(extensionSubElement, 'camunda:OutputParameter')) {
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
      var inputOutput;

      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements',
                                                        { values: [] }, bo, bpmnFactory);
        inputOutput = elementHelper.createElement('camunda:InputOutput',
                                                        { outputParameters: [] }, extensionElements, bpmnFactory);
        createOutputParameter(element, values, inputOutput, inputOutput.get('outputParameters'), bpmnFactory);
        extensionElements.get('values').push(inputOutput);

        cmd =  {
          extensionElements: extensionElements
        };
      }   
      else {
        var foundInputOutput = false;
        forEach(extensionElements.get('values'), function(extensionElement) {
          if (is(extensionElement, 'camunda:InputOutput')) {
            foundInputOutput = true;
            inputOutput = extensionElement;
          }
        });
        if(foundInputOutput){
            inputOutput.outputParameters = [];
            createOutputParameter(element, values, inputOutput, 
                        inputOutput.get('outputParameters'), bpmnFactory);
            cmd =  {
              extensionElements: extensionElements
            };
        }
        else{
            inputOutput = elementHelper.createElement('camunda:InputOutput',
                                                        { outputParameters: [] }, bo, bpmnFactory);
            var extensionValues = extensionElements.get('values');
            var inputOutputValues = inputOutput.get('outputParameters');
            createOutputParameter(element, values, inputOutput, inputOutputValues, bpmnFactory);
            extensionValues.push(inputOutput);
            cmd =  {
              extensionElements: extensionElements
            };
        }
      }

      return cmd;
    },

    validateListItem: function(element, values) {
      var validationResult = {};

      if(values.parameterType === 'script') {
        validationResult = script.validate(element, values);
      }
      else if(values.parameterType === 'map'){
        validationResult.map = [];
        for(var i=0; values.map !== undefined && i<values.map.length; i++){
            validationResult.map[i] = map.validate(element,
                                                            values.map[i]);          
        }
      }      
      else if(values.parameterType === 'list'){
        validationResult.list = [];
        for(var ii=0; values.list !== undefined && ii<values.list.length; ii++){
            validationResult.list[ii] = list.validate(element,
                                                            values.list[ii]);          
        }
      }
      else if(values.parameterType === 'text' && !values.parameterValue) {
        validationResult.parameterValue = "Must provide a value";
      }

      return validationResult;
    },

    addOutputParameter: function(element, outputNode) {
      var parameterContainer = domQuery('[data-list-table-container]', outputNode);
      lastIdx++;
      var template = domify(createParameterTemplate(lastIdx));
      parameterContainer.appendChild(template);
      return true;
    },

    removeOutputParameter: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    },

    clearParameterName:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=parameterName]', scopeNode);
      input.value = '';
      return true;
    },

    canClearParameterName: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=parameterName]', scopeNode);
      return input.value !== '';
    },

    clearParameterValue:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=parameterValue]', scopeNode);
      input.value = '';
      return true;
    },

    canClearParameterValue: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=parameterValue]', scopeNode);
      return input.value !== '';
    },

    isText: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=parameterType]', scopeNode);
      return type === 'text';
    },

    isMap: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=parameterType]', scopeNode);
      return type === 'map';
    },

    isList: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=parameterType]', scopeNode);
      return type === 'list';
    },

    isScript: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=parameterType]', scopeNode);
      return type === 'script';
    },

    isNotScript: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=parameterType]', scopeNode);
      return type !== 'script';
    },

    script: script,
    map: map,
    list: list,

    cssClasses: ['textfield']
   });

};
