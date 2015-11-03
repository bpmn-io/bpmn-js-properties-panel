'use strict';

var domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  forEach = require('lodash/collection/forEach'),

  utils = require('../../../../Utils');


module.exports = {

	template:
    // decision ref value
    '<label for="cam-decision-ref-val" data-show="dmn.isDMN">Decision Ref</label>' +
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '<input id="cam-decision-ref-val" type="text" name="decisionRefValue" />' +
      '<button data-action="dmn.clear" data-show="dmn.canClear">' +
        '<span>X</span>' +
      '</button>' +
    '</div>' +

    // decision ref binding
    '<label for="cam-decision-ref-binding" data-show="dmn.isDMN">Decision Ref Binding</label>' +
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '<select id="cam-decision-ref-binding" name="decisionRefBinding">' +
        '<option value="latest">latest</option>' + // default value
        '<option value="deployment">deployment</option>' +
        '<option value="version">version</option>' +
      '</select>' +
    '</div>' +

    // decision ref version
    '<label for="cam-decision-ref-version" data-show="dmn.isDMNVersion">Decision Ref Version</label>' +
    '<div class="field-wrapper" data-show="dmn.isDMNVersion">' +
      '<input id="cam-decision-ref-version" type="text" name="decisionRefVersion" />' +
      '<button data-action="dmn.clearVersion" data-show="dmn.canClearVersion">' +
        '<span>X</span>' +
      '</button>' +
    '</div>' +

    // result variable
    '<label for="cam-dmn-result-variable" data-show="dmn.isDMN">Result Variable</label>' +
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '<input id="cam-dmn-result-variable" type="text" name="dmnResultVariable" />' +
      '<button data-action="dmn.clearResVar" data-show="dmn.canClearResVar">' +
        '<span>X</span>' +
      '</button>' +
    '</div>' +

    // map decision result
    '<label for="cam-map-decision-result" data-show="dmn.isResultVariableSet">Map Decision Result</label>' +
    '<div class="field-wrapper" data-show="dmn.isResultVariableSet">' +
      '<select id="cam-map-decision-result" name="mapDecisionResult">' +
        '<option value="singleValue">singleValue</option>' + // default value
        '<option value="singleOutput">singleOutput</option>' +
        '<option value="collectValues">collectValues</option>' +
        '<option value="outputList">outputList</option>' +
      '</select>' +
    '</div>',

    get: function(implType, implValue, values, bo) {
      values.decisionRefValue = implValue;

      var decisionRefBinding = bo.get('camunda:decisionRefBinding');
      if (!!decisionRefBinding) {

        var options = domQuery.all('select[name="decisionRefBinding"] > option');
        // set select box value
        forEach(options, function(option) {
          if(option.value === decisionRefBinding) {
            domAttr(option, 'selected', 'selected');
          } else {
            domAttr(option, 'selected', null);
          }
        });

        values.decisionRefBinding = decisionRefBinding;
      }

      var decisionRefVersion = bo.get('camunda:decisionRefVersion');
      if(!!decisionRefVersion && values.decisionRefBinding === 'version') {
        values.decisionRefVersion = decisionRefVersion;
      }

      values.dmnResultVariable = bo.get('camunda:resultVariable');

      var mapDecisionResult = bo.get('camunda:mapDecisionResult');
      if (!!mapDecisionResult && !!values.dmnResultVariable) {
        var mapDecisionResultTypes = domQuery.all('select[name="mapDecisionResult"] > option');
        // set select box value
        forEach(mapDecisionResultTypes, function(mapDecisionResultType) {
          if(mapDecisionResultType.value === mapDecisionResult) {
            domAttr(mapDecisionResultType, 'selected', 'selected');
          } else {
            domAttr(mapDecisionResultType, 'selected', null);
          }
        });

        values.mapDecisionResult = mapDecisionResult;
      }
    },

    setEmpty: function(update) {
      update['camunda:decisionRef'] = undefined;
      update['camunda:decisionRefBinding'] = undefined;
      update['camunda:decisionRefVersion'] = undefined;
      update['camunda:resultVariable'] = undefined;
      update['camunda:mapDecisionResult'] = undefined;
    },

    set: function(values, update) {
      update['camunda:'+ values.implType] = values.decisionRefValue;
      update['camunda:decisionRefBinding'] = values.decisionRefBinding;
      update['camunda:resultVariable'] = values.dmnResultVariable;

      if (!!values.decisionRefVersion && values.decisionRefBinding === 'version') {
        update['camunda:decisionRefVersion'] = values.decisionRefVersion;
      }

      if (!!values.dmnResultVariable && !!values.mapDecisionResult) {
        update['camunda:mapDecisionResult'] = values.mapDecisionResult;
      }
    },

    validate: function(values, validationResult) {
      if(!values.decisionRefValue) {
        validationResult.decisionRefValue = "Must provide a value";
      }

      if (!!values.decisionRefBinding && values.decisionRefBinding === 'version' && !values.decisionRefVersion) {
        validationResult.decisionRefVersion = "Must provide a value";
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
      var implType = domQuery('select[name="implType"] > option:checked', inputNode.parentElement);

      if(implType === null) {
         implType =
                  domQuery('select[name="decisionRefBinding"] > option[selected=selected]', inputNode.parentElement);
      }

      var decisionRefBinding = domQuery('select[name="decisionRefBinding"] > option:checked', inputNode.parentElement);

      if(decisionRefBinding === null) {
         decisionRefBinding =
                  domQuery('select[name="decisionRefBinding"] > option[selected=selected]', inputNode.parentElement);
      }

      if (!!implType && !!decisionRefBinding) {
        if (implType.value === 'decisionRef' && decisionRefBinding.value === 'version') {
          return true;
        }
      } else {
        return false;
      }
    },

    isResultVariableSet: function(element, inputNode) {
      var dmnResultVariable = domQuery('input[name="dmnResultVariable"]', inputNode.parentElement);

      if (!!dmnResultVariable && dmnResultVariable.value !== '') {
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