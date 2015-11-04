'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  cmdHelper = require('../../../helper/CmdHelper');

var forEach = require('lodash/collection/forEach');

module.exports = function(group, element, bpmnFactory) {
  var events = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  // Message and Signal Event Definition
  forEach(events, function(event) {
    if(is(element, event)) {

      var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

      if(messageEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectMessage',
          description: '',
          label: 'Message Definition',
          businessObject: messageEventDefinition,
          referencedType: 'bpmn:Message',
          referenceProperty: 'messageRef'
        }));
      }

      if(signalEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectSignal',
          description: '',
          label: 'Signal Definition',
          businessObject: signalEventDefinition,
          referencedType: 'bpmn:Signal',
          referenceProperty: 'signalRef'
        }));
      }
    }
  });

  // Special Case: Receive Task
  if(is(element, 'bpmn:ReceiveTask')) {
    group.entries.push(entryFactory.referenceCombobox({
      id: 'selectMessage-ReceiveTask',
      description: '',
      label: 'Message Definition',
      businessObject: getBusinessObject(element),
      referencedType: 'bpmn:Message',
      referenceProperty: 'messageRef'
    }));
  }

  // Error Event Definition
  var errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent'
  ];

  forEach(errorEvents, function(event) {
    if(is(element, event)) {

      var errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(element);

      if(errorEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectError',
          description: '',
          label: 'Error Definition',
          businessObject: errorEventDefinition,
          referencedType: 'bpmn:Error',
          referenceProperty: 'errorRef',
          referencedObjectToString: function(obj) {
            var code = (obj.errorCode) ? obj.errorCode : '';
            return obj.name + ' (id=' + obj.id + ';errorCode=' + code + ')';
          }
        }));
      }
    }
  });

  // Escalation Event Definition
  var escalationEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent'
  ];

  forEach(escalationEvents, function(event) {
    if(is(element, event)) {

      // get business object
      var escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(element);

      if(escalationEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectEscalation',
          description: '',
          label: 'Escalation Definition',
          businessObject: escalationEventDefinition,
          referencedType: 'bpmn:Escalation',
          referenceProperty: 'escalationRef',
          referencedObjectToString: function(obj) {
            var code = (obj.escalationCode) ? obj.escalationCode : '';
            return obj.name + ' (id=' + obj.id + ';escalationCode=' + code + ')';
          }
        }));
      }
    }

  });

  // Timer Event Definition
  var timerEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  forEach(timerEvents, function(event) {
    if(is(element, event)) {

      // get business object
      var timerEventDefinition = eventDefinitionHelper.getTimerEventDefinition(element);

      if(timerEventDefinition) {
          group.entries.push({
              'id': 'timer-event-definition',
              'description': 'Configure the timer event definition',
              'html': '<label for="camunda-delegate">Timer Definition</label>' +
                      '<div class="field-wrapper">' +
                        '<input id="camunda-timerEventDefinition" type="text" name="timerEventDefinition" />' +
                        '<button data-action="clear" data-show="canClear">' +
                          '<span>X</span>' +
                        '</button>' +
                      '</div>' +

                      '<ul class="radios-group">' +
                        '<li>' +
                          '<input type="radio" ' +
                                'id="time-date" ' +
                                'name="timerEventDefinitionType" ' +
                                'value="timeDate">' +
                          '<label for="time-date">Date</label>' +
                        '</li>' +
                        '<li>' +
                          '<input type="radio" ' +
                                'id="time-duration" ' +
                                'name="timerEventDefinitionType" ' +
                                'value="timeDuration">' +
                          '<label for="time-duration">Duration</label>' +
                        '</li>' +
                        '<li>' +
                          '<input type="radio" ' +
                                'id="time-cycle" ' +
                                'name="timerEventDefinitionType" ' +
                                'value="timeCycle">' +
                          '<label for="time-cycle">Cycle</label>' +
                         '</li>' +
                       '</ul>',

              get: function (element, propertyName) {

                // read values from xml:
                var boTimeDuration = timerEventDefinition.get('timeDuration'),
                    boTimeDate = timerEventDefinition.get('timeDate'),
                    boTimeCycle = timerEventDefinition.get('timeCycle');

                var timerEventDefinitionValue,
                    timerEventDefinitionTypeValue;

                if(!!boTimeDuration && !!boTimeDuration.get('body')) {
                  timerEventDefinitionValue = boTimeDuration.get('body');
                  timerEventDefinitionTypeValue = 'timeDuration';
                }
                else if (!!boTimeDate && !!boTimeDate.get('body')) {
                  timerEventDefinitionValue = boTimeDate.get('body');
                  timerEventDefinitionTypeValue = 'timeDate';
                }
                else if(!!boTimeCycle && boTimeCycle.get('body')) {
                  timerEventDefinitionValue = boTimeCycle.get('body');
                  timerEventDefinitionTypeValue = 'timeCycle';
                }

                return {
                  timerEventDefinition: timerEventDefinitionValue,
                  timerEventDefinitionType: timerEventDefinitionTypeValue
                };
              },
              set: function (element, values, containerElement) {

                var timerEventDefinitionTypeValue = values.timerEventDefinitionType;
                var timerEventDefinitionValue = values.timerEventDefinition;

                var update = {
                  "timeDuration": undefined,
                  "timeDate": undefined,
                  "timeCycle": undefined
                };

                if(!!timerEventDefinitionTypeValue) {
                  update[timerEventDefinitionTypeValue] = elementHelper.createElement
                  (
                    'bpmn:FormalExpression',
                    { body: timerEventDefinitionValue },
                    timerEventDefinition,
                    bpmnFactory
                  );
                }

                return cmdHelper.updateBusinessObject(element, timerEventDefinition, update);
              },
              validate: function(element, values) {
                var timerEventDefinitionTypeValue = values.timerEventDefinitionType;
                var timerEventDefinitionValue = values.timerEventDefinition;

                var validationResult = {};

                if(!timerEventDefinitionValue && !!timerEventDefinitionTypeValue) {
                  validationResult.timerEventDefinition = "Value must provide a value.";
                }

                if(!!timerEventDefinitionValue && !timerEventDefinitionTypeValue) {
                  validationResult.timerEventDefinitionType = "Must select a radio button";
                }

                return validationResult;
              },
              clear: function(element, inputNode) {
                // clear text input
                domQuery('input[name=timerEventDefinition]', inputNode).value='';
                // clear radio button selection
                var checkedRadio = domQuery('input[name=timerEventDefinitionType]:checked', inputNode);
                if(!!checkedRadio) {
                  checkedRadio.checked = false;
                }
                return true;
              },
              canClear: function(element, inputNode) {
                var input = domQuery('input[name=timerEventDefinition]', inputNode);
                var radioButton = domQuery('input[name=timerEventDefinitionType]:checked', inputNode);
                return input.value !== '' || !!radioButton;
              },
              cssClasses: ['textfield']
            });
      }
    }
  });
};

