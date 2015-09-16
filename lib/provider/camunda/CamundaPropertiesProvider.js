'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
    userTaskProps = require('./parts/UserTaskProps'),
    asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps'),
    processProps = require('./parts/ProcessProps'),
    eventProps = require('./parts/EventProps'),
    linkProps = require('./parts/LinkProps'),
    callActivityProps = require('./parts/CallActivityProps'),
    documentationProps = require('./parts/DocumentationProps'),
    multiInstanceProps = require('./parts/MultiInstanceLoopProps'),
    jobRetryTimeCycle = require('./parts/JobRetryTimeCycle');

function DefaultPropertiesProvider(eventBus, bpmnFactory) {

  PropertiesActivator.call(this, eventBus);

  this.getGroups = function(element) {

    var generalGroup = {
      id: 'general',
      label: 'General',
      entries: []
    };
    processProps(generalGroup, element);
    serviceTaskDelegateProps(generalGroup, element);
    multiInstanceProps(generalGroup, element, bpmnFactory);
    userTaskProps(generalGroup, element);
    linkProps(generalGroup, element);
    callActivityProps(generalGroup, element);
    eventProps(generalGroup, element);

    var asyncGroup = {
      id : 'asyncGroup',
      label: 'Asynchronous Continuations',
      entries : []
    };
    asynchronousContinuationProps(asyncGroup, element, bpmnFactory);
    jobRetryTimeCycle(asyncGroup, element, bpmnFactory);


    var documentationGroup = {
      id: 'documentation',
      label: 'Documentation',
      entries: []
    };

    documentationProps(documentationGroup, element);

    return[
      generalGroup,
      asyncGroup,
      documentationGroup
    ];
  };
}

inherits(DefaultPropertiesProvider, PropertiesActivator);

module.exports = DefaultPropertiesProvider;
