'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var asyncCapableHelper = require('../../helper/AsyncCapableHelper');

// bpmn properties
var processProps = require('../bpmn/parts/ProcessProps'),
    eventProps = require('../bpmn/parts/EventProps'),
    linkProps = require('../bpmn/parts/LinkProps'),
    documentationProps = require('../bpmn/parts/DocumentationProps'),
    idProps = require('../bpmn/parts/IdProps'),
    nameProps = require('../bpmn/parts/NameProps');

// camunda properties
var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
    userTaskProps = require('./parts/UserTaskProps'),
    asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps'),
    callActivityProps = require('./parts/CallActivityProps'),
    multiInstanceProps = require('./parts/MultiInstanceLoopProps'),
    sequenceFlowProps = require('./parts/SequenceFlowProps'),
    executionListenerProps = require('./parts/ExecutionListenerProps'),
    scriptProps = require('./parts/ScriptTaskProps'),
    taskListenerProps = require('./parts/TaskListenerProps'),
    formProps = require('./parts/FormProps'),
    startEventInitiator = require('./parts/StartEventInitiator'),
    variableMapping = require('./parts/VariableMappingProps');

// Input/Output
var inputOutput = require('./parts/InputOutputProps'),
    inputOutputParameter = require('./parts/InputOutputParameterProps');

// Connector
var connectorDetails = require('./parts/ConnectorDetailProps'),
    connectorInputOutput = require('./parts/ConnectorInputOutputProps'),
    connectorInputOutputParameter = require('./parts/ConnectorInputOutputParameterProps');

// properties
var properties = require('./parts/PropertiesProps');

// job configuration
var jobConfiguration = require('./parts/JobConfigurationProps');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('../../helper/EventDefinitionHelper'),
    implementationTypeHelper = require('../../helper/ImplementationTypeHelper');

// helpers ////////////////////////////////////////

var isJobConfigEnabled = function(element) {
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant'))  {
    return true;
  }

  // async behavior
  var bo = getBusinessObject(element);
  if (asyncCapableHelper.isAsyncBefore(bo) || asyncCapableHelper.isAsyncAfter(bo)) {
    return true;
  }

  // timer definition
  if (is(element, 'bpmn:Event'))  {
    return !!eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return false;
};

var getInputOutputParameterLabel = function(param) {

  if (is(param, 'camunda:InputParameter')) {
    return 'Input Parameter';
  }

  if (is(param, 'camunda:OutputParameter')) {
    return 'Output Parameter';
  }

  return '';
};

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
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory);
  userTaskProps(detailsGroup, element);
  scriptProps(detailsGroup, element, bpmnFactory);
  linkProps(detailsGroup, element);
  callActivityProps(detailsGroup, element, bpmnFactory);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry);
  sequenceFlowProps(detailsGroup, element, bpmnFactory);
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
  jobConfiguration(jobConfigurationGroup, element, bpmnFactory);

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

function createVariablesTabGroups(element, bpmnFactory, elementRegistry) {
  var variablesGroup = {
    id : 'variables',
    label : 'Variables',
    entries: []
  };
  variableMapping(variablesGroup, element, bpmnFactory);

  return [
    variablesGroup
  ];
}

function createFormsTabGroups(element, bpmnFactory, elementRegistry) {
  var formGroup = {
    id : 'forms',
    label : 'Forms',
    entries: []
  };
  formProps(formGroup, element, bpmnFactory);

  return [
    formGroup
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

  var inputOutputGroup = {
    id: 'input-output',
    label: 'Parameters',
    entries: []
  };

  var options = inputOutput(inputOutputGroup, element, bpmnFactory);

  var inputOutputParameterGroup = {
    id: 'input-output-parameter',
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedParameter(element, node);
    },
    label: function(element, node) {
      var param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param);
    }
  };

  inputOutputParameter(inputOutputParameterGroup, element, bpmnFactory, options);

  return [
    inputOutputGroup,
    inputOutputParameterGroup
  ];
}

function createConnectorTabGroups(element, bpmnFactory, elementRegistry) {
  var connectorDetailsGroup = {
    id: 'connector-details',
    label: 'Details',
    entries: []
  };

  connectorDetails(connectorDetailsGroup, element, bpmnFactory);

  var connectorInputOutputGroup = {
    id: 'connector-input-output',
    label: 'Input/Output',
    entries: []
  };

  var options = connectorInputOutput(connectorInputOutputGroup, element, bpmnFactory);

  var connectorInputOutputParameterGroup = {
    id: 'connector-input-output-parameter',
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedParameter(element, node);
    },
    label: function(element, node) {
      var param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param);
    }
  };

  connectorInputOutputParameter(connectorInputOutputParameterGroup, element, bpmnFactory, options);

  return [
    connectorDetailsGroup,
    connectorInputOutputGroup,
    connectorInputOutputParameterGroup
  ];
}

function createExtensionElementsGroups(element, bpmnFactory, elementRegistry) {

  var propertiesGroup = {
    id : 'extension-elements-properties',
    label: 'Properties',
    entries: []
  };
  properties(propertiesGroup, element, bpmnFactory);

  return [
    propertiesGroup
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

    var variablesTab = {
      id: 'variables',
      label: 'Variables',
      groups: createVariablesTabGroups(element, bpmnFactory, elementRegistry)
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

    var connectorTab = {
      id: 'connector',
      label: 'Connector',
      groups: createConnectorTabGroups(element, bpmnFactory, elementRegistry),
      enabled: function(element) {
        var bo = implementationTypeHelper.getServiceTaskLikeBusinessObject(element);
        return bo && implementationTypeHelper.getImplementationType(bo) === 'connector';
      }
    };

    var extensionsTab = {
      id: 'extension-elements',
      label: 'Extensions',
      groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry)
    };

    return [
      generalTab,
      variablesTab,
      connectorTab,
      formsTab,
      listenersTab,
      inputOutputTab,
      extensionsTab
    ];
  };

}

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
