'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  propertyEntryFactory = require('../../../PropertyEntryFactory');

var forEach = require('lodash/collection/forEach');

function getLinkEventDefinition(element) {

  var bo = getBusinessObject(element);

  var linkEventDefinition = null;
  if(bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(eventDefinition) {
      if(is(eventDefinition, 'bpmn:LinkEventDefinition')) {
        linkEventDefinition = eventDefinition;
      }
    });
  }

  return linkEventDefinition;
}

module.exports = function(group, element) {
  var linkEvents = [ 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent' ];

  forEach(linkEvents, function(event) {
    if(is(element, event)) {

      var linkEventDefinition = getLinkEventDefinition(element);

      if(linkEventDefinition) {
        var entry = propertyEntryFactory.textField({
          id: 'link-event-' + event.substr(5),
          description: '',
          label: 'Link Name',
          modelProperty: 'link-name'
        });

        entry.get = function () {
          return { 'link-name': linkEventDefinition.get('name')};
        };

        entry.set = function (element, values) {
          var changes = {};
          changes['name'] = values['link-name'];

          return {
            cmd:'properties-panel.update-businessobject',
            context: {
              element: element,
              businessObject: linkEventDefinition,
              properties: changes
            }
          };
        };

        group.entries.push(entry);
      }
    }
  });
};

