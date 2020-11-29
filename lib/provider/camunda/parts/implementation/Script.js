'use strict';

var domQuery = require('min-dom').query,
    escapeHTML = require('../../../../Utils').escapeHTML,
    utils = require('../../../../Utils');


function getScriptType(node, idPrefix) {

  // if we have an idPrefix, work with specific selector
  var selector;

  if (idPrefix && idPrefix != '') {
    selector = 'select[id="' + idPrefix + 'cam-script-type"]';
  } else {
    selector = 'select[name="scriptType"]';
  }

  return utils.selectedType(selector, node.parentElement);
}


module.exports = function(scriptLanguagePropName, scriptValuePropName, isFormatRequired, translate, options) {
  var idPrefix = options && options.idPrefix || '';

  return {
    template:
    '<div class="bpp-row bpp-textfield">' +
      '<label for="' + idPrefix + 'cam-script-format">' + escapeHTML(translate('Script Format')) + '</label>' +
      '<div class="bpp-field-wrapper">' +
        '<input id="' + idPrefix + 'cam-script-format" type="text" name="scriptFormat" />' +
        '<button class="action-button clear" data-action="script.clearScriptFormat" data-show="script.canClearScriptFormat">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    '<div class="bpp-row">' +
      '<label for="' + idPrefix + 'cam-script-type">' + escapeHTML(translate('Script Type')) + '</label>' +
      '<div class="bpp-field-wrapper">' +
        '<select id="' + idPrefix + 'cam-script-type" name="scriptType" data-value>' +
          '<option value="script" selected>' + escapeHTML(translate('Inline Script')) + '</option>' +
          '<option value="scriptResource">' + escapeHTML(translate('External Resource')) + '</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    '<div class="bpp-row bpp-textfield">' +
      '<label for="' + idPrefix + 'cam-script-resource-val" data-show="script.isScriptResource">' + escapeHTML(translate('Resource')) + '</label>' +
      '<div class="bpp-field-wrapper" data-show="script.isScriptResource">' +
        '<input id="' + idPrefix + 'cam-script-resource-val" type="text" name="scriptResourceValue" />' +
        '<button class="action-button clear" data-action="script.clearScriptResource" data-show="script.canClearScriptResource">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    '<div class="bpp-row">' +
      '<label for="' + idPrefix + 'cam-script-val" data-show="script.isScript">' + escapeHTML(translate('Script')) + '</label>' +
      '<div class="bpp-field-wrapper" data-show="script.isScript">' +
        '<textarea id="' + idPrefix + 'cam-script-val" type="text" name="scriptValue"></textarea>' +
      '</div>'+
    '</div>',

    get: function(element, bo) {
      var values = {};

      // read values from xml:
      var boScriptResource = bo.get('camunda:resource'),
          boScript = bo.get(scriptValuePropName),
          boScriptFormat = bo.get(scriptLanguagePropName);

      if (typeof boScriptResource !== 'undefined') {
        values.scriptResourceValue = boScriptResource;
        values.scriptType = 'scriptResource';
      } else {
        values.scriptValue = boScript;
        values.scriptType = 'script';
      }

      values.scriptFormat = boScriptFormat;

      return values;
    },

    set: function(element, values, containerElement) {
      var scriptFormat = values.scriptFormat,
          scriptType = values.scriptType,
          scriptResourceValue = values.scriptResourceValue,
          scriptValue = values.scriptValue;

      // init update
      var update = {
        'camunda:resource': undefined
      };
      update[scriptValuePropName] = undefined;
      update[scriptLanguagePropName] = undefined;

      if (isFormatRequired) {

        // always set language
        update[scriptLanguagePropName] = scriptFormat || '';
      } else

      // set language only when scriptFormat has a value
      if (scriptFormat !== '') {
        update[scriptLanguagePropName] = scriptFormat;
      }

      // set either inline script or resource
      if ('scriptResource' === scriptType) {
        update['camunda:resource'] = scriptResourceValue || '';
      } else {
        update[scriptValuePropName] = scriptValue || '';
      }

      return update;
    },

    validate: function(element, values) {
      var validationResult = {};

      if (values.scriptType === 'script' && !values.scriptValue) {
        validationResult.scriptValue = translate('Must provide a value');
      }

      if (values.scriptType === 'scriptResource' && !values.scriptResourceValue) {
        validationResult.scriptResourceValue = translate('Must provide a value');
      }

      if (isFormatRequired && (!values.scriptFormat || values.scriptFormat.length === 0)) {
        validationResult.scriptFormat = translate('Must provide a value');
      }

      return validationResult;
    },

    clearScriptFormat: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=scriptFormat]', scopeNode).value='';

      return true;
    },

    canClearScriptFormat: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=scriptFormat]', scopeNode);

      return input.value !== '';
    },

    clearScriptResource: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=scriptResourceValue]', scopeNode).value='';

      return true;
    },

    canClearScriptResource: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=scriptResourceValue]', scopeNode);

      return input.value !== '';
    },

    clearScript: function(element, inputNode, btnNode, scopeNode) {
      domQuery('textarea[name=scriptValue]', scopeNode).value='';

      return true;
    },

    canClearScript: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('textarea[name=scriptValue]', scopeNode);

      return input.value !== '';
    },

    isScriptResource: function(element, inputNode, btnNode, scopeNode) {
      var scriptType = getScriptType(scopeNode, idPrefix);
      return scriptType === 'scriptResource';
    },

    isScript: function(element, inputNode, btnNode, scopeNode) {
      var scriptType = getScriptType(scopeNode, idPrefix);
      return scriptType === 'script';
    }

  };

};
