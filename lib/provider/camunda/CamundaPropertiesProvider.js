'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

// bpmn properties
var processProps = require('../bpmn/parts/ProcessProps'),
    eventProps = require('../bpmn/parts/EventProps'),
    linkProps = require('../bpmn/parts/LinkProps'),
    documentationProps = require('../bpmn/parts/DocumentationProps'),
    idProps = require('../bpmn/parts/IdProps');

// camunda properties
var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
    userTaskProps = require('./parts/UserTaskProps'),
    asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps'),
    callActivityProps = require('./parts/CallActivityProps'),    
    multiInstanceProps = require('./parts/MultiInstanceLoopProps'),
    jobRetryTimeCycle = require('./parts/JobRetryTimeCycle'),
    sequenceFlowProps = require('./parts/SequenceFlowProps'),
    executionListenerProps = require('./parts/ExecutionListenerProps'),
    scriptProps = require('./parts/ScriptTaskProps');

function DefaultPropertiesProvider(eventBus, bpmnFactory, elementRegistry) {

  PropertiesActivator.call(this, eventBus);

  this.getGroups = function(element) {

    var generalGroup = {
      id: 'general',
      label: 'General',
      entries: []
    };
    idProps(generalGroup, element, elementRegistry);
    processProps(generalGroup, element);

    var detailsGroup = {
      id: 'details',
      label: 'Details',
      entries: []
    };
    serviceTaskDelegateProps(detailsGroup, element);
    userTaskProps(detailsGroup, element);
    scriptProps(detailsGroup, element, bpmnFactory);
    linkProps(detailsGroup, element);
    callActivityProps(detailsGroup, element);
    eventProps(detailsGroup, element, bpmnFactory);
    sequenceFlowProps(detailsGroup, element, bpmnFactory);

    var multiInstanceGroup = {
      id: 'multiInstance',
      label: 'Multi Instance',
      entries: []
    };
    multiInstanceProps(multiInstanceGroup, element, bpmnFactory);

    var asyncGroup = {
      id : 'asyncGroup',
      label: 'Asynchronous Continuations',
      entries : []
    };
    asynchronousContinuationProps(asyncGroup, element, bpmnFactory);
    jobRetryTimeCycle(asyncGroup, element, bpmnFactory);

    var listenerGroup = {
      id : 'listener',
      label: 'Listener',
      entries: []
    };
    executionListenerProps(listenerGroup, element, bpmnFactory);

    var documentationGroup = {
      id: 'documentation',
      label: 'Documentation',
      entries: []
    };
    documentationProps(documentationGroup, element);

    return[
      generalGroup,
      detailsGroup,
      multiInstanceGroup,
      asyncGroup,
      listenerGroup,
      documentationGroup
    ];
  };
}

inherits(DefaultPropertiesProvider, PropertiesActivator);

module.exports = DefaultPropertiesProvider;
