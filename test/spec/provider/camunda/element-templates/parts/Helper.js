'use strict';

var TestHelper = require('../../../../../TestHelper');

var domQuery = require('min-dom/lib/query'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var slice = Array.prototype.slice;


function entrySelect(entryId, childSelector, all) {

  return TestHelper.getBpmnJS().invoke(function(propertiesPanel) {

    var container = propertiesPanel._container;

    var entry = container.querySelector('[data-entry="' + entryId + '"]');

    var result;

    if (!entry) {
      return all ? [] : null;
    } else {
      if (childSelector) {
        result = entry[all ? 'querySelectorAll' : 'querySelector'](childSelector);
        return all ? slice.call(result) : result;
      } else {
        return all ? [ entry ] : entry;
      }
    }
  });
}

entrySelect.all = function(entryId, childSelector) {
  return entrySelect(entryId, childSelector, true);
}

module.exports.entrySelect = entrySelect;


function selectAndGet(elementId) {

  return TestHelper.getBpmnJS().invoke(function(selection, elementRegistry) {

    var element = elementRegistry.get(elementId);

    expect(element).to.exist;

    selection.select(element);

    return getBusinessObject(element);
  });
}

module.exports.selectAndGet = selectAndGet;