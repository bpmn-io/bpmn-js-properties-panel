'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  cmdHelper = require('../../../helper/CmdHelper'),

  delegate = require('./implementation/Delegate'),
  dmn = require('./implementation/Dmn'),
  external = require('./implementation/External');


module.exports = function(group, element) {
  var bo;

  if (is(element, 'camunda:ServiceTaskLike')) {
    bo = getBusinessObject(element);
  } else
  if ( is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent') ) {
     /**
      * change business object to 'messageEventDefinition' when
      * the element is a message intermediate throw event or message end event
      * because the camunda extensions (e.g. camunda:class) are in the message event definition tag
      * and not in the intermediate throw event or end event tag
      */
     var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element);
     if (messageEventDefinition) {
       bo = messageEventDefinition;
     }
  }

  if (!bo) {
    return;
  }

  var hasDmnSupport = is(element, 'camunda:DmnCapable');
  var hasExternalSupport = is(element, 'camunda:ExternalCapable');

  group.entries.push({
    'id': 'implementation',
    'description': 'Configure the implementation of the task.',
    label: 'Implementation',
    'html': '<div class="pp-row">' +
              '<label for="cam-impl-type">Implementation Type</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="cam-impl-type" name="implType" data-value>' +
                  '<option value="class">Java Class</option>' +
                  '<option value="expression">Expression</option>' +
                  '<option value="delegateExpression">Delegate Expression</option>' +

                  ( hasDmnSupport ?
                    '<option value="decisionRef">DMN</option>'
                    : '') +

                  ( hasExternalSupport ?
                     '<option value="type">External</option>'
                    : '') +

                  '<option value="" selected></option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            delegate.template +

            ( hasDmnSupport ? dmn.template : '') +

            ( hasExternalSupport ? external.template : ''),

    get: function (element, propertyName) {

      // read values from xml:
      var boExpression = bo.get('camunda:expression'),
          boDelegate = bo.get('camunda:delegateExpression'),
          boClass = bo.get('camunda:class'),
          boDecisionRef = bo.get('camunda:decisionRef'),
          boType = bo.get('camunda:type');

      var values = {},
        implType = '';

      if(typeof boExpression !== 'undefined') {
        implType = 'expression';
        delegate.get(implType, boExpression, values, bo);
      }
      else if(typeof boDelegate !== 'undefined') {
        implType = 'delegateExpression';
        delegate.get(implType, boDelegate, values, bo);
      }
      else if(typeof boClass !== 'undefined') {
        implType = 'class';
        delegate.get(implType, boClass, values, bo);
      }
      else if (typeof boDecisionRef !== 'undefined') {
        implType = 'decisionRef';
        dmn.get(implType, boDecisionRef, values, bo);
      }
      else if (boType === 'external') {
        implType = 'type';
        external.get(implType, boType, values, bo);
      }

      values.implType = implType;

      return values;

    },
    set: function (element, values, containerElement) {

      var implType = values.implType,
        update = {};

      delegate.setEmpty(update);
      (hasDmnSupport ? dmn.setEmpty(update) : '');
      (hasExternalSupport ? external.setEmpty(update) : '');

      if(!!implType) {
        if(delegate.delegateImplTypes.indexOf(implType) >= 0) {
          delegate.set(values, update);
        } else if (implType === 'decisionRef') {
          dmn.set(values, update);
        } else if (implType === 'type') {
          external.set(values, update);
        }
      }

      return cmdHelper.updateBusinessObject(element, bo, update);
    },
    validate: function(element, values) {
      var implType = values.implType,
        validationResult = {};

      if(!!implType) {

        if(delegate.delegateImplTypes.indexOf(implType) >= 0) {
          delegate.validate(values, validationResult);
        } else if (implType === 'decisionRef') {
          dmn.validate(values, validationResult);
        } else if (implType === 'type') {
          external.validate(values, validationResult);
        }

      }

      return validationResult;
    },

    delegate: delegate,
    dmn: dmn,
    external : external,

    cssClasses: ['pp-textfield']
  });
};
