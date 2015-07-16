'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query');

module.exports = function(group, element) {
  if(is(element, 'camunda:ServiceTaskLike')) {
    group.entries.push(
      {
        'id': 'class',
        'description': 'References a Java class with the JavaDelegate-Interface',
        label: 'Delegate Method',
        'html': '<label for="camunda-class">Delegate Method</label>' +
                '<input id="camunda-class" type="text" name="delegate" />' +

                '<ul class="radios-group">' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-class" ' +
                      'name="delegate-resolution" ' +
                      'value="class">' +
                    '<label for="resolution-class">Class</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-delegateExpression" ' +
                      'name="delegate-resolution" ' +
                      'value="delegateExpression">' +
                    '<label for="resolution-delegateExpression">Delegate Expression</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-expression" ' +
                      'name="delegate-resolution" ' +
                      'value="expression">' +
                    '<label for="resolution-expression">Expression</label>' +
                  '</li>' +
                '</ul>',

        'get': function (element, propertyName) {

          var bo = getBusinessObject(element),
            boExpression = bo.get('expression'),
            boDelegate = bo.get('delegateExpression'),
            boClass = bo.get('class'),
            inputDelegate = domQuery('input[name=delegate]', propertyName).value,
            delegateResolutionElement = domQuery('input[name=delegate-resolution]:checked', propertyName),
            delegateResolution,
            currentValue;

          // initial set of a value
          if(typeof boExpression != 'undefined') {
            currentValue = boExpression;
            delegateResolution = 'expression';
          } else if(typeof boDelegate != 'undefined') {
            currentValue = boDelegate;
            delegateResolution = 'delegateExpression';
          } else {
            currentValue = boClass;
            delegateResolution = 'class';
          }

          // value of the new radio button
          if(delegateResolutionElement != null) {
            delegateResolution = delegateResolutionElement.value;
          }

          // value of the new delegate command
          if(typeof inputDelegate != 'undefined') {
            currentValue = inputDelegate;
          }

          if(delegateResolution == 'expression') {
            return { delegate : currentValue, 'delegate-resolution': 'expression' }
          } else if(delegateResolution == 'delegateExpression') {
            return { delegate : currentValue , 'delegate-resolution': 'delegateExpression'}
          } else {
            return { delegate : currentValue, 'delegate-resolution': 'class' }
          }

        },
        'set': function (element, values, containerElement) {
          var delegateResolutionElement = domQuery('input[name=delegate-resolution]:checked', containerElement),
            delegateResolution = (delegateResolutionElement != null) ? delegateResolutionElement.value : 'class';

          switch (delegateResolution) {
            case 'expression':
              return { expression: values.delegate };
            case 'delegateExpression':
              return { delegateExpression: values.delegate };
            default:
              return { class: values.delegate}
          }

        },
        validate: function() {
          return {}
        }
      }
    );
  }
};
