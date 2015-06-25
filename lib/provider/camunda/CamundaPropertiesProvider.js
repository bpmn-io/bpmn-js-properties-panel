'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
  userTaskProps = require('./parts/UserTaskProps');

var is = require('bpmn-js/lib/util/ModelUtil').is;

function DefaultPropertiesProvider(eventBus, bpmnFactory) {

  PropertiesActivator.call(this, eventBus);

  this.getGroups = function(element) {

    var generalGroup = {
      id: 'General',
      entries: []
    };

    serviceTaskDelegateProps(generalGroup, element);

    var userTaskGroup = {
      id : 'userTaskGroup',
      entries : []
    };

    userTaskProps(userTaskGroup, element);

    return[
      generalGroup,
      userTaskGroup
    ];
  };
}

inherits(DefaultPropertiesProvider, PropertiesActivator);

module.exports = DefaultPropertiesProvider;