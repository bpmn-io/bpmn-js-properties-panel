'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../factory/EntryFactory'),
    elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper');

var jobRetryTimeCycle = require('./implementation/JobRetryTimeCycle'),
    asyncContinuation = require('./implementation/AsyncContinuation');

function getLoopCharacteristics(element) {
  var bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

module.exports = function(group, element, bpmnFactory) {
  var businessObject = getBusinessObject(element);

  if (!businessObject || !is(businessObject.loopCharacteristics, 'camunda:Collectable')) {
    return;
  }

  var bo = businessObject.loopCharacteristics;

  group.entries.push(
    {
      'id': 'multi-instance',
      'description': 'Configure the multi instance loop characteristics',
      'html': '<div class="pp-radios-group">' +
                '<div class="pp-radio-wrapper">' +
                  '<input type="radio" ' +
                        'id="loop-cardinality" ' +
                        'name="multiInstanceLoopType" ' +
                        'value="loopCardinality">' +
                  '<label for="loop-cardinality">Loop Cardinality</label>' +
                '</div>' +

                '<div class="pp-radio-wrapper">' +
                  '<input type="radio" ' +
                        'id="collection" ' +
                        'name="multiInstanceLoopType" ' +
                        'value="collection">' +
                  '<label for="collection">Collection</label>' +
                '</div>' +
              '</div>' +

              '<div class="pp-field-wrapper">' +
                '<input id="camunda-multiInstance" type="text" name="multiInstance" />' +
                '<button class="clear" data-action="clear" data-show="canClear">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +

              '<div class="pp-row">' +
                '<label for="camunda-elementVariable" data-show="isCollection">Element Variable</label>' +
                '<div class="pp-field-wrapper" data-show="isCollection">' +
                  '<input id="camunda-elementVariable" type="text" name="elementVariable" />' +
                  '<button class="clear" data-action="clearElementVar" data-show="canClearElementVar">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>' +
              '</div>',

       get: function (element, propertyName) {

        // read values from xml:
        var boLoopCardinality = bo.get('loopCardinality'),
            boCollection = bo.get('camunda:collection'),
            elementVariable = bo.get('camunda:elementVariable');

        var res = {},
            multiInstanceValue,
            multiInstanceLoopTypeValue;

        if(!!boLoopCardinality && !!boLoopCardinality.get('body')) {
          multiInstanceValue = boLoopCardinality.get('body');
          multiInstanceLoopTypeValue = 'loopCardinality';
        }
        else if(!!boCollection) {
          multiInstanceValue = boCollection;
          multiInstanceLoopTypeValue = 'collection';
        }

        res.multiInstance = multiInstanceValue;
        res.multiInstanceLoopType = multiInstanceLoopTypeValue;

        if(elementVariable) {
          res.elementVariable = elementVariable;
        }

        return res;
      },
      set: function (element, values, containerElement) {

        var multiInstanceLoopTypeValue = values.multiInstanceLoopType;
        var multiInstanceValue = values.multiInstance;
        var elementVariableValue = values.elementVariable;

        var update = {
          "camunda:collection": undefined,
          "camunda:elementVariable": undefined,
          "loopCardinality": undefined
        };

        if(!!multiInstanceLoopTypeValue) {
          if("loopCardinality" === multiInstanceLoopTypeValue) {
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
            // element variable is only set for multi instance type 'collection'
            if(!!elementVariableValue) {
              update['camunda:elementVariable'] = elementVariableValue;
            }
          }
        }

        return cmdHelper.updateBusinessObject(element, bo, update);
      },
      validate: function(element, values) {
        var multiInstanceLoopTypeValue = values.multiInstanceLoopType;
        var multiInstanceValue = values.multiInstance;

        var validationResult = {};

        if(!multiInstanceValue && !!multiInstanceLoopTypeValue) {
          validationResult.multiInstance = "Value must provide a value.";
        }

        if(!!multiInstanceValue && !multiInstanceLoopTypeValue) {
          validationResult.multiInstanceLoopType = "Must select a radio button";
        }

        return validationResult;
      },
      clear: function(element, inputNode) {
        // clear text input
        domQuery('input[name=multiInstance]', inputNode).value='';
        return true;
      },
      canClear: function(element, inputNode) {
        var input = domQuery('input[name=multiInstance]', inputNode);
        var radioButton = domQuery('input[name=multiInstanceLoopType]:checked', inputNode);
        return input.value !== '' || !!radioButton;
      },
      isCollection: function(element, node) {
        var multiInstanceLoopType = domQuery('input[name=multiInstanceLoopType]:checked', node.parentElement);

        return multiInstanceLoopType === null || multiInstanceLoopType.value === 'collection';
      },
      clearElementVar: function(element, inputNode) {
        // clear text input
        domQuery('input[name=elementVariable]', inputNode).value='';
        return true;
      },
      canClearElementVar: function(element, inputNode) {
        var input = domQuery('input[name=elementVariable]', inputNode);
        return input.value !== '';
      },
      cssClasses: ['pp-textfield']
    }
  );

  // Completion Condition
  group.entries.push(entryFactory.textField({
    id: 'completionCondition',
    description: '',
    label: 'Completion Condition',
    modelProperty: 'completionCondition',

    get: function(element) {
      var loopCharacteristics = getLoopCharacteristics(element),
          completionCondition = loopCharacteristics.get('completionCondition'),
          value = completionCondition && completionCondition.get('body');

      return {
        completionCondition: value
      };
    },

    set: function(element, values) {
      var completionCondition = values.completionCondition;

      var update = {
        completionCondition: undefined
      };

      if (completionCondition) {
        update.completionCondition = elementHelper.createElement('bpmn:FormalExpression',
          {body: completionCondition}, bo, bpmnFactory);
      }

      return cmdHelper.updateBusinessObject(element, bo, update);
    }
  }));


  // async continuation ///////////////////////////////////////////////////////

  group.entries = group.entries.concat(asyncContinuation(element, bpmnFactory, {
    getBusinessObject: getLoopCharacteristics,
    idPrefix: 'multi-instance-',
    labelPrefix: 'Multi Instance '
  }));


  // retry time cycle //////////////////////////////////////////////////////////

  group.entries = group.entries.concat(jobRetryTimeCycle(element, bpmnFactory, {
    getBusinessObject: getLoopCharacteristics,
    idPrefix: 'multi-instance-',
    labelPrefix: 'Multi Instance '
  }));
};
