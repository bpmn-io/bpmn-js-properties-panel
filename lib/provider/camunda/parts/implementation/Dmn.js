'use strict';

var domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  forEach = require('lodash/collection/forEach'),

  utils = require('../../../../Utils');

function setDecisionRefBindingDefault(inputNode) {
  // clear decision binding select box selection
  var options = domQuery('select[name=decisionRefBinding]', inputNode.parentElement);
  // set decision binding on default 'latest'
  options.selectedIndex = 0;
}


module.exports = {

	template:
    // decision ref value
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '<label for="cam-decision-ref-val">Decision Ref</label>' +
      '</br>' +
      '<input id="cam-decision-ref-val" type="text" name="decisionRefValue" />' +
      '<button data-action="dmn.clear" data-show="dmn.canClear">' +
        '<span>X</span>' +
      '</button>' +
    '</div>' +

    '</br>' +

    // decision ref binding
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '<label for="cam-decision-ref-binding" data-show="dmn.isDMN">Decision Ref Binding</label>' +
      '<select id="cam-decision-ref-binding" name="decisionRefBinding">' +
        '<option value="latest">latest</option>' + // default value
        '<option value="deployment">deployment</option>' +
        '<option value="version">version</option>' +
      '</select>' +
    '</div>' +

    // decision ref version
    '<div class="field-wrapper" data-show="dmn.isDMNVersion">' +
      '</br>' +
      '<label for="cam-decision-ref-version">Decision Ref Version</label>' +
      '</br>' +
      '<input id="cam-decision-ref-version" type="text" name="decisionRefVersion" />' +
      '<button data-action="dmn.versionClear" data-show="dmn.versionCanClear">' +
        '<span>X</span>' +
      '</button>' +
    '</div>' +

    // result variable
    '<div class="field-wrapper" data-show="dmn.isDMN">' +
      '</br>' +
      '<label for="cam-dmn-result-variable">Result Variable</label>' +
      '</br>' +
      '<input id="cam-dmn-result-variable" type="text" name="dmnResultVariable" />' +
      '<button data-action="dmn.resVarClear" data-show="dmn.resVarCanClear">' +
        '<span>X</span>' +
      '</button>' +
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
    },

    setEmpty: function(update) {
      update['camunda:decisionRef'] = undefined;
      update['camunda:decisionRefBinding'] = undefined;
      update['camunda:decisionRefVersion'] = undefined;
    },

    set: function(values, update) {
      update['camunda:'+ values.implType] = values.decisionRefValue;
      update['camunda:decisionRefBinding'] = values.decisionRefBinding;
      update['camunda:resultVariable'] = values.dmnResultVariable;

      if (!!values.decisionRefVersion && values.decisionRefBinding === 'version') {
        update['camunda:decisionRefVersion'] = values.decisionRefVersion;
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
      var type = utils.selectedType(inputNode);
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

    versionClear: function(element, inputNode) {
      domQuery('input[name=decisionRefVersion]', inputNode).value='';

      return true;
    },

    versionCanClear: function(element, inputNode) {
      var input = domQuery('input[name=decisionRefVersion]', inputNode);

      return input.value !== '';
    },

    resVarClear: function(element, inputNode) {
      domQuery('input[name=dmnResultVariable]', inputNode).value='';

      return true;
    },

    resVarCanClear: function(element, inputNode) {
      var input = domQuery('input[name=dmnResultVariable]', inputNode);

      return input.value !== '';
    },      
};