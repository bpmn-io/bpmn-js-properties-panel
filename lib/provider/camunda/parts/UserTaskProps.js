'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element) {
  if(is(element, 'camunda:Assignable')) {
    group.entries.push(
      {
        'id': 'assignee',
        'description': 'Assignee of the User Task',
        'html': '<label for="camunda-assignee">Assignee: </label><input id="camunda-assignee" type="text" name="assignee" />',
        'get': function (element, propertyName) {

          var bo = getBusinessObject(element);

          return { assignee: bo.get('assignee') }
        },
        'set': function (element, values) {

          return { assignee: values.assignee }
        },
        validate: function() {
          return {}
        }
      }
    );
  }
};