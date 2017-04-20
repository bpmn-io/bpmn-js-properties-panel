'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var entryFactory = require('../../../factory/EntryFactory');

var participantHelper = require('../../../helper/ParticipantHelper');

module.exports = function(group, element, translate) {

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(element, 'bpmn:Process') || (is(element, 'bpmn:Participant') && bo.get('processRef'))) {

    var executableEntry = entryFactory.checkbox({
      id: 'process-is-executable',
      label: translate('Executable'),
      modelProperty: 'isExecutable'
    });

    // in participants we have to change the default behavior of set and get
    if (is(element, 'bpmn:Participant')) {
      executableEntry.get = function(element) {
        return participantHelper.getProcessBusinessObject(element, 'isExecutable');
      };

      executableEntry.set = function(element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'isExecutable', values);
      };
    }

    group.entries.push(executableEntry);
  }

};
