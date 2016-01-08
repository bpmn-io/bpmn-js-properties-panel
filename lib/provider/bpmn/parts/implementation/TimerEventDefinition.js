'use strict';

var domQuery = require('min-dom/lib/query'),
    elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');


function TimerEventDefinition(group, element, bpmnFactory, timerEventDefinition) {
  group.entries.push({
    'id': 'timer-event-definition',
    'description': 'Configure the timer event definition',
    'html': '<label for="camunda-delegate">Timer Definition</label>' +
            '<div class="pp-field-wrapper">' +
              '<input id="camunda-timerEventDefinition" type="text" name="timerEventDefinition" />' +
              '<button data-action="clear" data-show="canClear">' +
                '<span>X</span>' +
              '</button>' +
            '</div>' +

            '<ul class="pp-radios-group">' +
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
        'timeDuration': undefined,
        'timeDate': undefined,
        'timeCycle': undefined
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

      if(!timerEventDefinitionValue && timerEventDefinitionTypeValue) {
        validationResult.timerEventDefinition = 'Value must provide a value.';
      }

      if(timerEventDefinitionValue && !timerEventDefinitionTypeValue) {
        validationResult.timerEventDefinitionType = 'Must select a radio button';
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

    cssClasses: ['pp-textfield']
  });
}

module.exports = TimerEventDefinition;
