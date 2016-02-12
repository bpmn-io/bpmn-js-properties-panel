'use strict';

var domQuery = require('min-dom/lib/query');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var entryFactory = require('../../../factory/EntryFactory');

var participantHelper = require('../../../helper/ParticipantHelper'),
    cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element) {

  if (is(element, 'camunda:JobPriorized') || is(element, 'bpmn:Participant')) {
    // Job Priority Field
    var bo = getBusinessObject(element);

    var entry = {
      id: 'job-priority',
      description: 'Priority of a job.',
      label: 'Job Priority',
      modelProperty: 'jobPriority',

      get: function(element, propertyName) {
        var boJobPriority = bo.get('camunda:jobPriority');

        return { jobPriority: boJobPriority };
      },

      set: function(element, values) {
        return cmdHelper.updateProperties(element, {
          'camunda:jobPriority': values.jobPriority
        });
      },

      clear: function(element, inputNode) {
        // clear text input
        domQuery('input[name=jobPriority]', inputNode).value='';

        return true;
      },

      canClear: function(element, inputNode) {
        var input = domQuery('input[name=jobPriority]', inputNode);

        return input.value !== '';
      }
    };

    // in participants we have to change the default behavior of set and get
    if (is(element, 'bpmn:Participant')) {
      entry.get = function (element) {
        return participantHelper.getProcessBusinessObject(element, 'jobPriority');
      };

      entry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'jobPriority', values);
      };
    }


    group.entries.push(entryFactory.textField(entry));
  }
};