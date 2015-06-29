'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
    userTaskProps = require('./parts/UserTaskProps'),
    flowNodeProps = require('./parts/FlowNodeProps'),
    processProps = require('./parts/ProcessProps');

function DefaultPropertiesProvider(eventBus, bpmnFactory) {

  PropertiesActivator.call(this, eventBus);

  this.getGroups = function(element) {

    var generalGroup = {
      id: 'General',
      entries: []
    };
    processProps(generalGroup, element);
    serviceTaskDelegateProps(generalGroup, element);

    var userTaskGroup = {
      id : 'userTaskGroup',
      entries : []
    };

    userTaskProps(userTaskGroup, element);

    var flowNodeGroup = {
      id : 'flowNodeGroup',
      entries : []
    };
    flowNodeProps(flowNodeGroup, element);

    return[
      generalGroup,
      userTaskGroup,
      flowNodeGroup
    ];
  };
}

inherits(DefaultPropertiesProvider, PropertiesActivator);

module.exports = DefaultPropertiesProvider;