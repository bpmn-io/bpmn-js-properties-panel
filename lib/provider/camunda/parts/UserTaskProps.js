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

    // Candidate Users
    group.entries.push(propertyEntryFactory.singleInputField({
      id : 'candidateUsers',
      description : 'A list of candidates for this User Task',
      label : 'Candidate Users',
      modelProperty : 'candidateUsers'
    }));

    // Candidate Groups
    group.entries.push(propertyEntryFactory.singleInputField({
      id : 'candidateGroups',
      description : 'A list of candidate groups for this User Task',
      label : 'Candidate Groups',
      modelProperty : 'candidateGroups'
    }));
  }
};
