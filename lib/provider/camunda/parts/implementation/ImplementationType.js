'use strict';

var cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper');

var assign = require('lodash/object/assign');

var DEFAULT_DELEGATE_PROPS = [ 'class', 'expression', 'delegateExpression' ];

var DELEGATE_PROPS = {
  'camunda:class': undefined,
  'camunda:expression': undefined,
  'camunda:delegateExpression': undefined,
  'camunda:resultVariable': undefined
};

var DMN_CAPABLE_PROPS = {
  'camunda:decisionRef': undefined,
  'camunda:decisionRefBinding': 'latest',
  'camunda:decisionRefVersion': undefined,
  'camunda:mapDecisionResult': 'resultList'
};


var EXTERNAL_CAPABLE_PROPS = {
  'camunda:type': undefined,
  'camunda:topic': undefined
};

module.exports = function(element, bpmnFactory, options) {

  var getType           = options.getImplementationType,
      getBusinessObject = options.getBusinessObject;

  var hasDmnSupport             = options.hasDmnSupport,
      hasExternalSupport        = options.hasExternalSupport,
      hasScriptSupport          = options.hasScriptSupport;

  var entries = [];

  entries.push({
    id: 'implementation',
    description: 'Configure the implementation of the task.',
    label: 'Implementation',
    html: '<div class="pp-row">' +
            '<label for="cam-impl-type">Implementation Type</label>' +
            '<div class="pp-field-wrapper">' +
              '<select id="cam-impl-type" name="implType" data-value>' +
                '<option value="class">Java Class</option>' +
                '<option value="expression">Expression</option>' +
                '<option value="delegateExpression">Delegate Expression</option>' +

                  ( hasDmnSupport ?
                    '<option value="dmn">DMN</option>'
                    : '') +

                  ( hasExternalSupport ?
                     '<option value="external">External</option>'
                    : '') +

                  ( hasScriptSupport ?
                     '<option value="script">Script</option>'
                    : '') +

                '<option value="" selected></option>' +
              '</select>' +
            '</div>' +
          '</div>',

    get: function (element, node) {
      return {
        implType: getType(element)
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var oldType = getType(element);
      var newType = values.implType;

      var props = assign({}, DELEGATE_PROPS);

      if (DEFAULT_DELEGATE_PROPS.indexOf(newType) !== -1) {

        var newValue = '';
        if (DEFAULT_DELEGATE_PROPS.indexOf(oldType) !== -1) {
          newValue = bo.get('camunda:' + oldType);
        }
        props['camunda:' + newType] = newValue;
      }

      if (hasDmnSupport) {
        props = assign(props, DMN_CAPABLE_PROPS);
        if (newType === 'dmn') {
          props['camunda:decisionRef'] = '';
        }
      }

      if (hasExternalSupport) {
        props = assign(props, EXTERNAL_CAPABLE_PROPS);
        if (newType === 'external') {
          props['camunda:type'] = 'external';
          props['camunda:topic'] = '';
        }
      }

      if (hasScriptSupport) {      
        props['camunda:script'] = undefined;

        if (newType === 'script') {
          props['camunda:script'] = elementHelper.createElement('camunda:Script', {}, bo, bpmnFactory);
        }
      }

      var commands = [];
      commands.push(cmdHelper.updateBusinessObject(element, bo, props));

      return commands;

    }
  });

  return entries;

};
