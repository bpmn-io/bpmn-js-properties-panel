'use strict';

var ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper'),
    InputOutputHelper        = require('../../../helper/InputOutputHelper');

var implementationType = require('./implementation/ImplementationType'),
    delegate           = require('./implementation/Delegate'),
    external           = require('./implementation/External'),
    callable           = require('./implementation/Callable'),
    resultVariable     = require('./implementation/ResultVariable');

var entryFactory = require('../../../factory/EntryFactory');

var domQuery   = require('min-dom/lib/query'),
    domClosest = require('min-dom/lib/closest'),
    domClasses = require('min-dom/lib/classes');

function getImplementationType(element) {
  return ImplementationTypeHelper.getImplementationType(element);
}

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function isDmnCapable(element) {
  return ImplementationTypeHelper.isDmnCapable(element);
}

function isExternalCapable(element) {
  return ImplementationTypeHelper.isExternalCapable(element);
}

function isServiceTaskLike(element) {
  return ImplementationTypeHelper.isServiceTaskLike(element);
}

module.exports = function(group, element, bpmnFactory, translate) {

  if (!isServiceTaskLike(getBusinessObject(element))) {
    return;
  }

  var hasDmnSupport = isDmnCapable(element);
  var hasExternalSupport = isExternalCapable(getBusinessObject(element));

  // implementation type ////////////////////////////////////

  group.entries = group.entries.concat(implementationType(element, bpmnFactory, {
    getBusinessObject: getBusinessObject,
    getImplementationType: getImplementationType,
    hasDmnSupport: hasDmnSupport,
    hasExternalSupport: hasExternalSupport,
    hasServiceTaskLikeSupport: true
  }, translate));


  // delegate (class, expression, delegateExpression) //////////

  group.entries = group.entries.concat(delegate(element, bpmnFactory, {
    getBusinessObject: getBusinessObject,
    getImplementationType: getImplementationType
  }, translate));


  // result variable /////////////////////////////////////////

  group.entries = group.entries.concat(resultVariable(element, bpmnFactory, {
    getBusinessObject: getBusinessObject,
    getImplementationType: getImplementationType,
    hideResultVariable: function(element, node) {
      return getImplementationType(element) !== 'expression';
    }
  }, translate));

  // external //////////////////////////////////////////////////

  if (hasExternalSupport) {
    group.entries = group.entries.concat(external(element, bpmnFactory, {
      getBusinessObject: getBusinessObject,
      getImplementationType: getImplementationType
    }, translate));
  }


  // dmn ////////////////////////////////////////////////////////

  if (hasDmnSupport) {
    group.entries = group.entries.concat(callable(element, bpmnFactory, {
      getCallableType: getImplementationType
    }, translate));
  }


  // connector ////////////////////////////////////////////////

  var isConnector = function(element) {
    return getImplementationType(element) === 'connector';
  };

  group.entries.push(entryFactory.link({
    id: 'configureConnectorLink',
    label: translate('Configure Connector'),
    getClickableElement: function(element, node) {
      var panel = domClosest(node, 'div.bpp-properties-panel');
      return domQuery('a[data-tab-target="connector"]', panel);
    },
    hideLink: function(element, node) {
      var link = domQuery('a', node);
      link.innerHTML = link.textContent = '';
      domClasses(link).remove('bpp-error-message');

      if (isConnector(element)) {
        var connectorId = InputOutputHelper.getConnector(element).get('connectorId');
        if (connectorId) {
          link.textContent = translate('Configure Connector');
        }
        else {
          link.innerHTML = '<span class="bpp-icon-warning"></span> Must configure Connector';
          domClasses(link).add('bpp-error-message');
        }

        return false;
      }
      return true;
    }
  }));

};
