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
    inputParameterProps = require('./parts/InputParameterProps'),    
    outputParameterProps = require('./parts/OutputParameterProps'),    
    formFieldProps = require('./parts/FormFieldProps'),    
    scriptProps = require('./parts/ScriptTaskProps'),
    taskListenerProps = require('./parts/TaskListenerProps'),
    startEventFormKey = require('./parts/StartEventFormKey'),
    jobPriorityProps = require('./parts/JobPriority');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('../../helper/EventDefinitionHelper');

// helpers ////////////////////////////////////////

var isJobConfigEnabled = function(element) {
  var bo = getBusinessObject(element),
      isProcess = is(element, 'bpmn:Process'),
      isParticipant = is(element, 'bpmn:Participant'),
      isTimerEvent = false;

  if( isProcess || isParticipant ) {
    return true;
  }

  // async behavior
  var hasAsyncBefore = !!bo.get('camunda:asyncBefore'),
      hasAsyncAfter = !!bo.get('camunda:asyncAfter'),
      isAsync = ( hasAsyncBefore || hasAsyncAfter );

  if( isAsync ) {
    return true;
  }

  // timer definition
  if( is(element, 'bpmn:Event') ) {
    isTimerEvent = eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return !!isTimerEvent;
};

// Camunda Properties Provider /////////////////////////////////////

function CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry) {

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
    startEventFormKey(detailsGroup, element);

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

    var listenerGroup = {
      id : 'listener',
      label: 'Listener',
      entries: []
    };
    executionListenerProps(listenerGroup, element, bpmnFactory);
    taskListenerProps(listenerGroup, element, bpmnFactory);
    
    var parameterGroup = {
      id : 'parameter',
      label: 'Parameter',
      entries: []
    };
    inputParameterProps(parameterGroup, element, bpmnFactory);
    outputParameterProps(parameterGroup, element, bpmnFactory);
    
    var formGroup = {
      id : 'form',
      label: 'Form',
      entries: []
    };
    formFieldProps(formGroup, element, bpmnFactory);

    var documentationGroup = {
      id: 'documentation',
      label: 'Documentation',
      entries: []
    };
    documentationProps(documentationGroup, element, bpmnFactory);

    return[
      generalGroup,
      detailsGroup,
      multiInstanceGroup,
      asyncGroup,
      jobConfigurationGroup,
      listenerGroup,
      parameterGroup,
      formGroup,
      documentationGroup
    ];
  };
}

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
