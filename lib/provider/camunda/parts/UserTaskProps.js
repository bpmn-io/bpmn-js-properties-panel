'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyEntryFactory = require('../../../PropertyEntryFactory');


module.exports = function(group, element) {
  if(is(element, 'camunda:Assignable')) {

    // Assignee
    group.entries.push(propertyEntryFactory.textField({
      id : 'assignee',
      description : 'Assignee of the User Task',
      label : 'Assignee',
      modelProperty : 'assignee'
    }));

    // Form Key
    group.entries.push(propertyEntryFactory.textField({
      id : 'formKey',
      description : 'URI to the form for this User Task',
      label : 'Form Key',
      modelProperty : 'formKey'
    }));

    // Candidate Users
    group.entries.push(propertyEntryFactory.textField({
      id : 'candidateUsers',
      description : 'A list of candidates for this User Task',
      label : 'Candidate Users',
      modelProperty : 'candidateUsers'
    }));

    // Candidate Groups
    group.entries.push(propertyEntryFactory.textField({
      id : 'candidateGroups',
      description : 'A list of candidate groups for this User Task',
      label : 'Candidate Groups',
      modelProperty : 'candidateGroups'
    }));

    // Due Date
    group.entries.push(propertyEntryFactory.textField({
      id : 'dueDate',
      description : 'The due date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)',
      label : 'Due Date',
      modelProperty : 'dueDate'
    }));

    // FollowUp Date
    group.entries.push(propertyEntryFactory.textField({
      id : 'followUpDate',
      description : 'The follow up date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)',
      label : 'Follow Up Date',
      modelProperty : 'followUpDate'
    }));

    // priority
    group.entries.push(propertyEntryFactory.textField({
      id : 'priority',
      description : 'Priority of this User Task',
      label : 'Priority',
      modelProperty : 'priority'
    }));
  }
};
