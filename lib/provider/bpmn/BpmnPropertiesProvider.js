'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var processProps = require('./parts/ProcessProps'),
    eventProps = require('./parts/EventProps'),
    linkProps = require('./parts/LinkProps'),
    documentationProps = require('./parts/DocumentationProps'),
    idProps = require('./parts/IdProps'),
    nameProps = require('./parts/NameProps');

function createGeneralTabGroups(element, bpmnFactory, elementRegistry) {

  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  idProps(generalGroup, element, elementRegistry);
  nameProps(generalGroup, element);
  processProps(generalGroup, element);

  var detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: []
  };
  linkProps(detailsGroup, element);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry);

  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory);

  return[
    generalGroup,
    detailsGroup,
    documentationGroup
  ];

}

function Provider(eventBus, bpmnFactory, elementRegistry) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry)
    };

    return [
      generalTab
    ];
  };
}

inherits(Provider, PropertiesActivator);

module.exports = Provider;
