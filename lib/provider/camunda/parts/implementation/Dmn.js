'use strict';

var domQuery = require('min-dom/lib/query'),

  utils = require('../../../../Utils');


module.exports = {

	template:
    // decision ref value
    '<div class="pp-row">' +
      '<label for="cam-decision-ref-val" data-show="dmn.isDMN">Decision Ref</label>' +
      '<div class="pp-field-wrapper" data-show="dmn.isDMN">' +
        '<input id="cam-decision-ref-val" type="text" name="decisionRefValue" />' +
        '<button class="clear" data-action="dmn.clear" data-show="dmn.canClear">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    // decision ref binding
    '<div class="pp-row">' +
      '<label for="cam-decision-ref-binding" data-show="dmn.isDMN">Decision Ref Binding</label>' +
      '<div class="pp-field-wrapper" data-show="dmn.isDMN">' +
        '<select id="cam-decision-ref-binding" name="decisionRefBinding" data-value>' +
          '<option value="latest" selected>latest</option>' + // default value
          '<option value="deployment">deployment</option>' +
          '<option value="version">version</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    // decision ref version
    '<div class="pp-row">' +
      '<label for="cam-decision-ref-version" data-show="dmn.isDMNVersion">Decision Ref Version</label>' +
      '<div class="pp-field-wrapper" data-show="dmn.isDMNVersion">' +
        '<input id="cam-decision-ref-version" type="text" name="decisionRefVersion" />' +
        '<button class="clear" data-action="dmn.clearVersion" data-show="dmn.canClearVersion">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    // result variable
    '<div class="pp-row">' +
      '<label for="cam-dmn-result-variable" data-show="dmn.isDMN">Result Variable</label>' +
      '<div class="pp-field-wrapper" data-show="dmn.isDMN">' +
        '<input id="cam-dmn-result-variable" type="text" name="dmnResultVariable" />' +
        '<button class="clear" data-action="dmn.clearResVar" data-show="dmn.canClearResVar">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    // map decision result
    '<div class="pp-row">' +
      '<label for="cam-map-decision-result" data-show="dmn.isResultVariableSet">Map Decision Result</label>' +
      '<div class="pp-field-wrapper" data-show="dmn.isResultVariableSet">' +
        '<select id="cam-map-decision-result" name="mapDecisionResult" data-value>' +
          '<option value="singleEntry">singleEntry</option>' +
          '<option value="singleResult">singleResult</option>' +
          '<option value="collectEntries">collectEntries</option>' +
          '<option value="resultList" selected>resultList</option>' + // default value
        '</select>' +
      '</div>' +
    '</div>',

    get: function(implType, implValue, values, bo) {
      values.decisionRefValue = implValue;

      var decisionRefBinding = bo.get('camunda:decisionRefBinding');
      if (decisionRefBinding) {

        values.decisionRefBinding = decisionRefBinding;
      }

      var decisionRefVersion = bo.get('camunda:decisionRefVersion');
      if(decisionRefVersion && values.decisionRefBinding === 'version') {
        values.decisionRefVersion = decisionRefVersion;
      }

      values.dmnResultVariable = bo.get('camunda:resultVariable');

      var mapDecisionResult = bo.get('camunda:mapDecisionResult');
      if (mapDecisionResult && values.dmnResultVariable) {
        values.mapDecisionResult = mapDecisionResult;
      }

    },

    setEmpty: function(update) {
      update['camunda:decisionRef'] = undefined;
      update['camunda:decisionRefBinding'] = 'latest';
      update['camunda:decisionRefVersion'] = undefined;
      update['camunda:resultVariable'] = undefined;
      update['camunda:mapDecisionResult'] = undefined;
    },

    set: function(values, update) {
      update['camunda:'+ values.implType] = values.decisionRefValue || '';
      update['camunda:decisionRefBinding'] = values.decisionRefBinding;

      if (values.dmnResultVariable !== '') {
        update['camunda:resultVariable'] = values.dmnResultVariable;
      }

      if (values.decisionRefBinding === 'version') {
        update['camunda:decisionRefVersion'] = values.decisionRefVersion || '';
      }

      if (values.dmnResultVariable && !!values.mapDecisionResult) {
        update['camunda:mapDecisionResult'] = values.mapDecisionResult;
      } else if (values.dmnResultVariable && !values.mapDecisionResult) {
        update['camunda:mapDecisionResult'] = 'resultList'; // default value
      }
    },

    validate: function(values, validationResult) {
      if(!values.decisionRefValue) {
        validationResult.decisionRefValue = 'Must provide a value';
      }

      if (values.decisionRefBinding && values.decisionRefBinding === 'version' && !values.decisionRefVersion) {
        validationResult.decisionRefVersion = 'Must provide a value';
      }
    },

    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=decisionRefValue]', inputNode).value='';

      return true;
    },

    canClear: function(element, inputNode) {
      var input = domQuery('input[name=decisionRefValue]', inputNode);

      return input.value !== '';
    },

    isDMN: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return type === 'decisionRef';
    },

    isDMNVersion: function(element, inputNode) {
      var implType = utils.selectedType('select[name="implType"]', inputNode.parentElement);

      var decisionRefBinding = utils.selectedType('select[name="decisionRefBinding"]', inputNode.parentElement);

      if (implType && !!decisionRefBinding) {
        if (implType === 'decisionRef' && decisionRefBinding === 'version') {
          return true;
        }
      } else {
        return false;
      }
    },

    isResultVariableSet: function(element, inputNode) {
      var dmnResultVariable = domQuery('input[name="dmnResultVariable"]', inputNode.parentElement);
      var type = utils.selectedType('select[name=implType]', inputNode);

      if (type === 'decisionRef' && dmnResultVariable && dmnResultVariable.value !== '') {
        return true;
      } else {
        return false;
      }
    },

    clearVersion: function(element, inputNode) {
      domQuery('input[name=decisionRefVersion]', inputNode).value='';

      return true;
    },

    canClearVersion: function(element, inputNode) {
      var input = domQuery('input[name=decisionRefVersion]', inputNode);

      return input.value !== '';
    },

    clearResVar: function(element, inputNode) {
      domQuery('input[name=dmnResultVariable]', inputNode).value='';

      return true;
    },

    canClearResVar: function(element, inputNode) {
      var input = domQuery('input[name=dmnResultVariable]', inputNode);

      return input.value !== '';
    },
};
