'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element, translate) {

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
    var versionTagEntry = entryFactory.textField({
      id: 'versionTag',
      label: translate('Version Tag'),
      modelProperty: 'versionTag'
    });

    // in participants we have to change the default behavior of set and get
    if (is(element, 'bpmn:Participant')) {
      versionTagEntry.get = function(element) {
        var processBo = bo.get('processRef');
        
        return {
          versionTag: processBo.get('camunda:versionTag')
        };
      };

      versionTagEntry.set = function(element, values) {
        var processBo = bo.get('processRef');

        return cmdHelper.updateBusinessObject(element, processBo, {
          'camunda:versionTag': values.versionTag || undefined
        });
      };
    }

    group.entries.push(versionTagEntry);

  }
};
