'use strict';

var ModelUtil         = require('bpmn-js/lib/util/ModelUtil'),
    is                = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var eventDefinitionHelper = require('./EventDefinitionHelper');

var ImplementationTypeHelper = {};

module.exports = ImplementationTypeHelper;

ImplementationTypeHelper.isServiceTaskLike = function(element) {
  return is(element, 'camunda:ServiceTaskLike');
};

ImplementationTypeHelper.isDmnCapable = function(element) {
  return is(element, 'camunda:DmnCapable');
};

ImplementationTypeHelper.isExternalCapable = function(element) {
  return is(element, 'camunda:ExternalCapable');
};

ImplementationTypeHelper.isListener = function(element) {
  return is(element, 'camunda:TaskListener') || is(element, 'camunda:ExecutionListener');
};

ImplementationTypeHelper.getServiceTaskLikeBusinessObject = function(element) {

  if (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')) {
     /**
      * change business object to 'messageEventDefinition' when
      * the element is a message intermediate throw event or message end event
      * because the camunda extensions (e.g. camunda:class) are in the message
      * event definition tag and not in the intermediate throw event or end event tag
      */
     var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element);
     if (messageEventDefinition) {
       element = messageEventDefinition;
     }    
  }

  return this.isServiceTaskLike(element) && getBusinessObject(element);

};

ImplementationTypeHelper.getImplementationType = function(element) {

  var bo = this.getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    if (this.isListener(element)) {
      bo = element;
    }
    else {
      return;
    }
  }

  if (this.isDmnCapable(bo)) {
    var decisionRef = bo.get('camunda:decisionRef');
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }

  if (this.isExternalCapable(bo)) {
    var type = bo.get('camunda:type');
    if (type === 'external') {
      return 'external';
    }
  }

  var cls = bo.get('camunda:class');
  if (typeof cls !== 'undefined') {
    return 'class';
  }

  var expression = bo.get('camunda:expression');
  if (typeof expression !== 'undefined') {
    return 'expression';
  }

  var delegateExpression = bo.get('camunda:delegateExpression');
  if (typeof delegateExpression !== 'undefined') {
    return 'delegateExpression';
  }

  if (this.isListener(bo)) {
    var script = bo.get('script');
    if (typeof script !== 'undefined') {
      return 'script';
    }
  }

};