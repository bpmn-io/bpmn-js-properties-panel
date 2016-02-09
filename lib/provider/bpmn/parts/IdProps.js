'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    utils = require('../../../Utils'),
    cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element) {

  // Id
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'id',
    description: '',
    label: 'Id',
    modelProperty: 'id',
    getProperty: function(element) {
      return element.id;
    },
    setProperty: function(element, properties) {
      return cmdHelper.updateProperties(element, properties);
    },
    validate: function(element, values) {
      var idValue = values.id;

      var bo = getBusinessObject(element);

      var idError = utils.isIdValid(bo, idValue);

      return idError ? { id: idError } : {};
    }
  }));

};
