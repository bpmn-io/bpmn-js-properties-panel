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
    scriptProps = require('./parts/ScriptTaskProps'),
    taskListenerProps = require('./parts/TaskListenerProps'),
    startEventFormKey = require('./parts/StartEventFormKey'),
    jobPriorityProps = require('./parts/JobPriority'),
    startEventInitiator = require('./parts/StartEventInitiator'),
    inputOutputParameters = require('./parts/InputOutputParametersProps');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('../../helper/EventDefinitionHelper');

// helpers ////////////////////////////////////////

var isJobConfigEnabled = function(element) {
  var bo = getBusinessObject(element),
      isProcess = is(element, 'bpmn:Process'),
      isParticipant = is(element, 'bpmn:Participant'),
      isTimerEvent = false;

  if (isProcess || isParticipant)  {
    return true;
  }

  // async behavior
  var hasAsyncBefore = bo.get('camunda:asyncBefore') || bo.get('camunda:async'),
      hasAsyncAfter = bo.get('camunda:asyncAfter'),
      isAsync = (hasAsyncBefore || hasAsyncAfter) ;

  if (isAsync)  {
    return true;
  }

  // timer definition
  if (is(element, 'bpmn:Event'))  {
    isTimerEvent = eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return !!isTimerEvent;
};

function createGeneralTabGroups(element, bpmnFactory, elementRegistry) {

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
  startEventFormKey(detailsGroup, element);
  startEventInitiator(detailsGroup, element); // this must be the last element of the details group!

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

  var jobConfigurationGroup = {
    id : 'jobConfigurationGroup',
    label : 'Job Configuration',
    entries : [],
    enabled: isJobConfigEnabled
  };
  jobPriorityProps(jobConfigurationGroup, element);
  jobRetryTimeCycle(jobConfigurationGroup, element, bpmnFactory);

  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };
  documentationProps(documentationGroup, element, bpmnFactory);

  return [
    generalGroup,
    detailsGroup,
    multiInstanceGroup,
    asyncGroup,
    jobConfigurationGroup,
    documentationGroup
  ];

}

function createFormsTabGroups(element, bpmnFactory, elementRegistry) {
  return [
  ];
}

function createListenersTabGroups(element, bpmnFactory, elementRegistry) {

  var executionListenersGroup = {
    id : 'executionListeners',
    label: 'Execution Listeners',
    entries: []
  };
  executionListenerProps(executionListenersGroup, element, bpmnFactory);

  var taskListenersGroup = {
    id : 'taskListeners',
    label: 'Task Listeners',
    entries: []
  };
  taskListenerProps(taskListenersGroup, element, bpmnFactory);

  return [
    executionListenersGroup,
    taskListenersGroup
  ];
}

function createInputOutputTabGroups(element, bpmnFactory, elementRegistry) {

  var inputOutputParametersGroups = {
    id : 'input-output-parameters',
    label: 'Parameters',
    entries: []
  };
  inputOutputParameters(inputOutputParametersGroups, element, bpmnFactory);

  return [
    inputOutputParametersGroups
  ];
}

// Camunda Properties Provider /////////////////////////////////////
function CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry)
    };

    var formsTab = {
      id: 'forms',
      label: 'Forms',
      groups: createFormsTabGroups(element, bpmnFactory, elementRegistry)
    };

    var listenersTab = {
      id: 'listeners',
      label: 'Listeners',
      groups: createListenersTabGroups(element, bpmnFactory, elementRegistry)
    };

    var inputOutputTab = {
      id: 'input-output',
      label: 'Input/Output',
      groups: createInputOutputTabGroups(element, bpmnFactory, elementRegistry)
    };

    return [
      generalTab,
      formsTab,
      listenersTab,
      inputOutputTab
    ];
  };

}

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
