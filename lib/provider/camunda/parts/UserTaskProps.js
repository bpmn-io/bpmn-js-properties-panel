'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyFactory = require('../../../PropertyFactory');


module.exports = function(group, element) {
  if(is(element, 'camunda:Assignable')) {
    group.entries.push(propertyFactory.textInput({
      id: 'assignee',
      description: 'Assignee of the User Task',
      label: 'Assignee',
      modelProperty: 'assignee'
    }));
  }
};
