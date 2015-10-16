'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  cmdHelper = require('../../../helper/CmdHelper'),
  forEach = require('lodash/collection/forEach'),
  domAttr = require('min-dom/lib/attr'),

  delegate = require('./implementation/Delegate'),
  dmn = require('./implementation/Dmn');


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

  group.entries.push({
    'id': 'implementation',
    'description': 'Configure the implementation of the task.',
    label: 'Implementation',
    'html': '<label for="cam-impl-type">Implementation Type</label>' +
            '<div class="field-wrapper">' +
              '<select id="cam-impl-type" name="implType">' +
                '<option value="class">Java Class</option>' +
                '<option value="expression">Expression</option>' +
                '<option value="delegateExpression">Delegate Expression</option>' +

                ( hasDmnSupport ? 
                  '<option value="decisionRef">DMN</option>'
                  : '') +

                '<option value=""></option>' +
              '</select>' +
            '</div>' +

            '</br>' +

            delegate.template +

            ( hasDmnSupport ? dmn.template : ''),

    get: function (element, propertyName) {

      // read values from xml:
      var boExpression = bo.get('camunda:expression'),
          boDelegate = bo.get('camunda:delegateExpression'),
          boClass = bo.get('camunda:class'),
          boDecisionRef = bo.get('camunda:decisionRef');

      var values = {},
        implType = '',
        options = domQuery.all('select#cam-impl-type > option', propertyName);

      if(!!boExpression) {
        implType = 'expression';
        delegate.get(implType, boExpression, values, bo);
      }
      else if(!!boDelegate) {
        implType = 'delegateExpression';
        delegate.get(implType, boDelegate, values, bo);
      }
      else if(!!boClass) {
        implType = 'class';
        delegate.get(implType, boClass, values, bo);
      }
      else if (!!boDecisionRef) {
        implType = 'decisionRef';
        dmn.get(implType, boDecisionRef, values, bo);
      }

      // set select box value
      forEach(options, function(option) {
        if(option.value === implType) {
          domAttr(option, 'selected', 'selected');
        }
        else {
          domAttr(option, 'selected', null);
        }
      });

      values.implType = implType;

      return values;

    },
    set: function (element, values, containerElement) {

      var implType = values.implType,
        update = {};

      delegate.setEmpty(update);
      dmn.setEmpty(update);

      if(!!implType) {
        if(delegate.delegateImplTypes.indexOf(implType) >= 0) {
          delegate.set(values, update);
        } else if (implType === 'decisionRef') {
          dmn.set(values, update);
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
        }

      }

      return validationResult;
    },

    delegate: delegate,
    dmn: dmn,

    cssClasses: ['textfield']
  });
};
