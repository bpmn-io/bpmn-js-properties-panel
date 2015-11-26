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
        group.entries.push(entryFactory.textField({
          id : 'messageName',
          description : 'Configure the name of a message event',
          label : 'Message Name',
          modelProperty : 'messageName',
          get: function(element) {
            var values = {};

            var boMessage = messageEventDefinition.get('messageRef');
            if (!!boMessage) {
              values.messageName = boMessage.get('name');
            }

            return values;
          },
          set: function(element, values) {
            var update = {};

            var boMessage = messageEventDefinition.get('messageRef');
            update.name = values.messageName;

            return cmdHelper.updateBusinessObject(element, boMessage, update);
          },
          validate: function(element, values) {
            var messageName = values.messageName;
            var validationResult = {};

            if(!messageName) {
              validationResult.messageName = "Must provide a value.";
            }

            return validationResult;
          },
          disabled: function(element, node) {
            var messageComboBox = domQuery('input[name=messageRef]', node.parentElement);
            if (!!messageComboBox.value) {
              return false;
            } else {
              return true;
            }
          }
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
        group.entries.push(entryFactory.textField({
          id : 'signalName',
          description : 'Configure the name of a signal event',
          label : 'Signal Name',
          modelProperty : 'signalName',
          get: function(element) {
            var values = {};

            var boSignal = signalEventDefinition.get('signalRef');
            if (!!boSignal) {
              values.signalName = boSignal.get('name');
            }

            return values;
          },
          set: function(element, values) {
            var update = {};

            var boSignal = signalEventDefinition.get('signalRef');
            update.name = values.signalName;

            return cmdHelper.updateBusinessObject(element, boSignal, update);
          },
          validate: function(element, values) {
            var signalName = values.signalName;
            var validationResult = {};

            if(!signalName) {
              validationResult.signalName = "Must provide a value.";
            }

            return validationResult;
          },
          disabled: function(element, node) {
            var signalComboBox = domQuery('input[name=signalRef]', node.parentElement);
            if (!!signalComboBox.value) {
              return false;
            } else {
              return true;
            }
          }
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
    group.entries.push(entryFactory.textField({
      id : 'messageName-ReceiveTask',
      description : 'Configure the name of a message event',
      label : 'Message Name',
      modelProperty : 'messageName',
      get: function(element) {
        var values = {};

        var boMessage = getBusinessObject(element).get('messageRef');
        if (!!boMessage) {
          values.messageName = boMessage.get('name');
        }

        return values;
      },
      set: function(element, values) {
        var update = {};

        var boMessage = getBusinessObject(element).get('messageRef');
        update.name = values.messageName;

        return cmdHelper.updateBusinessObject(element, boMessage, update);
      },
      validate: function(element, values) {
        var messageName = values.messageName;
        var validationResult = {};

        if(!messageName) {
          validationResult.messageName = "Must provide a value.";
        }

        return validationResult;
      },
      disabled: function(element, node) {
        var messageComboBox = domQuery('input[name=messageRef]', node.parentElement);
        if (!!messageComboBox.value) {
          return false;
        } else {
          return true;
        }
      }
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
            return obj.name + ' (id=' + obj.id + ')';
          }
        }));
        group.entries.push({
          'id': 'errorDefinition',
          'description': 'Configure the error element',
          label: 'Error Definition',
          'html': '<div class="pp-row" data-show=isErrorCodeSelected>' +
                    '<label for="cam-error-name">Error Name</label>' +
                    '<div class="field-wrapper">' +
                      '<input id="cam-error-name" type="text" name="errorName" />' +
                      '<button data-action="clearErrorName" data-show="canClearErrorName">' +
                        '<span>X</span>' +
                      '</button>' +
                    '</div>' +
                  '</div>' +

                  '<div class="pp-row" data-show=isErrorCodeSelected>' +
                    '<label for="cam-error-code">Error Code</label>' +
                    '<div class="field-wrapper">' +
                      '<input id="cam-error-code" type="text" name="errorCode" />' +
                      '<button data-action="clearErrorCode" data-show="canClearErrorCode">' +
                        '<span>X</span>' +
                      '</button>' +
                    '</div>' +
                  '</div>',

          get: function(element) {
            var values = {};

            var boError = errorEventDefinition.get('errorRef');
            if (!!boError) {
              values.errorCode = boError.get('errorCode');
              values.errorName = boError.get('name');
            }

            return values;
          },
          set: function(element, values) {
            var update = {
              "errorCode" : undefined
            };

            var boError = errorEventDefinition.get('errorRef');
            update.errorCode = values.errorCode;
            update.name = values.errorName;

            return cmdHelper.updateBusinessObject(element, boError, update);
          },
          validate: function(element, values) {
            var errorName = values.errorName;

            var validationResult = {};

            if(!errorName) {
              validationResult.errorName = "Must provide a value.";
            }

            return validationResult;

          },
          clearErrorName: function(element, inputNode) {
            // clear text input
            domQuery('input[name=errorName]', inputNode).value='';

            return true;
          },
          canClearErrorName: function(element, inputNode) {
            var input = domQuery('input[name=errorName]', inputNode);

            return input.value !== '';
          },
          clearErrorCode: function(element, inputNode) {
            // clear text input
            domQuery('input[name=errorCode]', inputNode).value='';

            return true;
          },
          canClearErrorCode: function(element, inputNode) {
            var input = domQuery('input[name=errorCode]', inputNode);

            return input.value !== '';
          },
          isErrorCodeSelected: function(element, node) {
            var errorComboBox = domQuery('input[name=errorRef]', node.parentElement);
            if (!!errorComboBox.value) {
              return true;
            } else {
              return false;
            }
          },

          cssClasses: ['textfield']
        });
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
            return obj.name + ' (id=' + obj.id + ')';
          }
        }));
        group.entries.push({
          'id': 'escalationDefinition',
          'description': 'Configure the escalation element',
          label: 'Escalation Definition',
          'html': '<div class="pp-row" data-show=isEscalationCodeSelected>' +
                    '<label for="cam-escalation-name">Escalation Name</label>' +
                    '<div class="field-wrapper">' +
                      '<input id="cam-escalation-name" type="text" name="escalationName" />' +
                      '<button data-action="clearEscalationName" data-show="canClearEscalationName">' +
                        '<span>X</span>' +
                      '</button>' +
                    '</div>' +
                  '</div>' +

                  '<div class="pp-row" data-show=isEscalationCodeSelected>' +
                    '<label for="cam-escalation-code">Escalation Code</label>' +
                    '<div class="field-wrapper">' +
                      '<input id="cam-escalation-code" type="text" name="escalationCode" />' +
                      '<button data-action="clearEscalationCode" data-show="canClearEscalationCode">' +
                        '<span>X</span>' +
                      '</button>' +
                    '</div>' +
                  '</div>',

          get: function(element) {
            var values = {};

            var boEscalation = escalationEventDefinition.get('escalationRef');
            if (!!boEscalation) {
              values.escalationCode = boEscalation.get('escalationCode');
              values.escalationName = boEscalation.get('name');
            }

            return values;
          },
          set: function(element, values) {
            var update = {
              "escalationCode" : undefined
            };

            var boEscalation = escalationEventDefinition.get('escalationRef');
            update.escalationCode = values.escalationCode;
            update.name = values.escalationName;

            return cmdHelper.updateBusinessObject(element, boEscalation, update);
          },
          validate: function(element, values) {
            var escalationName = values.escalationName;

            var validationResult = {};

            if(!escalationName) {
              validationResult.escalationName = "Must provide a value.";
            }

            return validationResult;

          },
          clearEscalationName: function(element, inputNode) {
            // clear text input
            domQuery('input[name=escalationName]', inputNode).value='';

            return true;
          },
          canClearEscalationName: function(element, inputNode) {
            var input = domQuery('input[name=escalationName]', inputNode);

            return input.value !== '';
          },
          clearEscalationCode: function(element, inputNode) {
            // clear text input
            domQuery('input[name=escalationCode]', inputNode).value='';

            return true;
          },
          canClearEscalationCode: function(element, inputNode) {
            var input = domQuery('input[name=escalationCode]', inputNode);

            return input.value !== '';
          },
          isEscalationCodeSelected: function(element, node) {
            var escalationComboBox = domQuery('input[name=escalationRef]', node.parentElement);
            if (!!escalationComboBox.value) {
              return true;
            } else {
              return false;
            }
          },

          cssClasses: ['textfield']
        });
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

