'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element, bpmnFactory) {
  var businessObject = getBusinessObject(element),
      asyncAfterButton,
      asyncBeforeButton;

  if(is(businessObject.loopCharacteristics, 'camunda:Collectable')) {

    group.entries.push(
      {
        'id': 'multi-instance',
        'description': 'Configure the multi instance loop characteristics',
        'html': '<div class="radios-group">' +
                  '<input type="radio" ' +
                        'id="loop-cardinality" ' +
                        'name="multiInstanceResolution" ' +
                        'value="loopCardinality">' +
                  '<label for="loop-cardinality">Loop Cardinality</label>' +
                  '</br>' +
                  '<input type="radio" ' +
                        'id="collection" ' +
                        'name="multiInstanceResolution" ' +
                        'value="collection">' +
                  '<label for="Collection">Collection</label>' +
                '</div>' +

                '<div class="field-wrapper">' +
                  '<input id="camunda-multiInstance" type="text" name="multiInstance" />' +
                  '<button data-action="clear" data-show="canClear">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>',

         get: function (element, propertyName) {

          // read values from xml:
          var bo = businessObject.get('loopCharacteristics'),
              boLoopCardinality = bo.get('loopCardinality'),
              boCollection = bo.get('camunda:collection');

          var multiInstanceValue = undefined,
              multiInstanceResolutionValue = undefined;

          if(!!boLoopCardinality && !!boLoopCardinality.get('body')) {
            multiInstanceValue = boLoopCardinality.get('body');
            multiInstanceResolutionValue = 'loopCardinality';
          }
          else if(!!boCollection) {
            multiInstanceValue = boCollection;
            multiInstanceResolutionValue = 'collection';
          }

          return {
            multiInstance: multiInstanceValue,
            multiInstanceResolution: multiInstanceResolutionValue
          };
        },
        set: function (element, values, containerElement) {

          var multiInstanceResolutionValue = values.multiInstanceResolution;
          var multiInstanceValue = values.multiInstance;

          var bo = businessObject.get('loopCharacteristics');

          var update = {
            "camunda:collection": undefined,
            "loopCardinality": undefined
          };

          if(!!multiInstanceResolutionValue) {
            if("loopCardinality" === multiInstanceResolutionValue) {
              update.loopCardinality = elementHelper.createElement
              (
                'bpmn:FormalExpression',
                { body: multiInstanceValue },
                bo,
                bpmnFactory
              );
            }
            else {
              update['camunda:collection'] = multiInstanceValue;
            }
          }

          return cmdHelper.updateBusinessObject(element, bo, update);
        },
        validate: function(element, values) {
          var multiInstanceResolutionValue = values.multiInstanceResolution;
          var multiInstanceValue = values.multiInstance;

          var validationResult = {};

          if(!multiInstanceValue && !!multiInstanceResolutionValue) {
            validationResult.multiInstance = "Value must provide a value.";
          }

          if(!!multiInstanceValue && !multiInstanceResolutionValue) {
            validationResult.multiInstanceResolution = "Must select a radio button";
          }

          return validationResult;
        },
        clear: function(element, inputNode) {
          // clear text input
          domQuery('input[name=multiInstance]', inputNode).value='';
          // clear radio button selection
          var checkedRadio = domQuery('input[name=multiInstanceResolution]:checked', inputNode);
          if(!!checkedRadio) {
            checkedRadio.checked = false;
          }
          return true;
        },
        canClear: function(element, inputNode) {
          var input = domQuery('input[name=multiInstance]', inputNode);
          var radioButton = domQuery('input[name=multiInstanceResolution]:checked', inputNode);
          return input.value !== '' || !!radioButton;
        },
        cssClasses: ['textfield']
      }
    );

    // completition Condition
    group.entries.push(entryFactory.textField({
      id: 'completionCondition',
      description: '',
      label: 'Completion Condition',
      modelProperty: 'completionCondition',
      set: function(element, values) {
        var loopCharacteristics = businessObject.get('loopCharacteristics'),
            completionCondition = values.completionCondition;

        var update = {
          completionCondition: undefined
        };

        if(!!completionCondition) {
          update.completionCondition = elementHelper
            .createElement('bpmn:FormalExpression', {body: completionCondition}, loopCharacteristics, bpmnFactory);
        }

        return cmdHelper.updateBusinessObject(element, loopCharacteristics, update);
      },
      get: function(element) {
        var loopCharacteristics = businessObject.get('loopCharacteristics'),
          entity = loopCharacteristics.get('completionCondition');

        var res = {};

        if(entity) {
          res.completionCondition = entity.get('body');
        }

        return res;
      }
    }));

    // AsyncBefore
    group.entries.push(entryFactory.checkbox({
      id: 'loopAsyncBefore',
      description: '',
      label: 'Multi Instance Asynchronous Before',
      modelProperty: 'loopAsyncBefore',
      get: function(element, node) {
        asyncBeforeButton = domQuery('input[name=loopAsyncBefore]', node);

        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncBefore: bo.get('asyncBefore') };
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        var properties = {};
        properties.asyncBefore = !!values.loopAsyncBefore;

        if(!asyncAfterButton.checked && !values.loopAsyncBefore) {
          properties.exclusive = true;
        }

        return cmdHelper.updateBusinessObject(element, businessObject, properties);
      }
    }));

    // AsyncAfter
    group.entries.push(entryFactory.checkbox({
      id: 'loopAsyncAfter',
      description: '',
      label: 'Multi Instance Asynchronous After',
      modelProperty: 'loopAsyncAfter',
      get: function(element, node) {
        asyncAfterButton = domQuery('input[name=loopAsyncAfter]', node);

        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncAfter: bo.get('asyncAfter') };
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        var properties = {};
        properties.asyncAfter = !!values.loopAsyncAfter;

        if(!asyncBeforeButton.checked && !values.loopAsyncAfter) {
          properties.exclusive = true;
        }

        return cmdHelper.updateBusinessObject(element, businessObject, properties);
      }
    }));

    // isConditional
    group.entries.push(
      entryFactory.checkbox({
        id: 'loopExclusive',
        description: '',
        label: 'Multi Instance Exclusive',
        modelProperty: 'loopExclusive',
        get: function(element) {
          var bo = getBusinessObject(element).get('loopCharacteristics');
          return { loopExclusive: bo.get('exclusive') };
        },
        set: function(element, values) {
          var businessObject = getBusinessObject(element).get('loopCharacteristics');

          return cmdHelper.updateBusinessObject(element, businessObject, {exclusive : !!values.loopExclusive });
        },
        disabled: function(element, node) {
          var asyncBeforeChecked = domQuery('input[name=loopAsyncBefore]', node.parentElement).checked,
              asyncAfterChecked = domQuery('input[name=loopAsyncAfter]', node.parentElement).checked;

          return !(asyncAfterChecked || !asyncBeforeChecked);
        }
      }));

  }
};