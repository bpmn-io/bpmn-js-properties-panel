'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyEntryFactory = require('../../../PropertyEntryFactory');


module.exports = function(group, element) {
  if(is(element, 'camunda:Assignable')) {

    // Assignee
    group.entries.push(propertyEntryFactory.singleInputField({
      id : 'assignee',
      description : 'Assignee of the User Task',
      label : 'Assignee',
      modelProperty : 'assignee'
    }));

    // Form Key
    group.entries.push(propertyEntryFactory.singleInputField({
      id : 'formKey',
      description : 'URI to the form for this User Task',
      label : 'Form Key',
      modelProperty : 'formKey'
    }));
  }
};
