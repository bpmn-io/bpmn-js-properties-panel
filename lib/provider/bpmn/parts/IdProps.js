'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


var SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
var QNAME_REGEX = /^[a-z][\w0-9-]*(:[a-z][\w0-9-]*)?$/i;

module.exports = function(group, element) {

  // Id
  group.entries.push(entryFactory.textField({
    id: 'id',
    description: '',
    label: 'Id',
    modelProperty: 'id',
    validate: function(element, values) {
      var idValue = values.id;

      var validationResult = {};

      var bo = getBusinessObject(element);
      var assigned = bo.$model.ids.assigned(idValue);

      var idExists = !!assigned && assigned !== bo;

      if (SPACE_REGEX.test(idValue)) {
        validationResult.id = 'Id must not contain spaces.';
      } else

      if (!idValue || idExists) {
        validationResult.id = 'Element must have an unique id.';
      } else

      if (!QNAME_REGEX.test(idValue)) {
        validationResult.id = 'Id must be a valid QName.';
      }

      return validationResult;
    }
  }));

};