'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  forEach = require('lodash/collection/forEach'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/camunda'),
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('call-activity-variable-mapping', function() {

  var diagramXML = require('./CallActivityVariableMapping.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: {camunda: camundaModdlePackage}
  }));


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));

  function getMappingsWithSourceAttr(extensionElements, type) {
    var mappings = [];

    if (extensionElements && extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, type) && (value.source || value.sourceExpression)) {
          mappings.push(value);
        }
      });
    }
    return mappings;
  }


  it('should fetch camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length.of(3);
    
    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, 'camunda:In');
    expect(sourceMappings).have.to.length.of(3);
  }));


  it('should fetch camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_6');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length.of(3);
    
    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, 'camunda:Out');
    expect(sourceMappings).have.to.length.of(3);
  }));


  it('should fetch camunda:in/camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(inSelectBox.options).to.have.length.of(2);
    expect(outSelectBox.options).to.have.length.of(2);
    
    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, 'camunda:In');
    expect(inSourceMappings).have.to.length.of(2);

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, 'camunda:Out');
    expect(outSourceMappings).have.to.length.of(2);
  }));

  // TODO: 
  // delete camunda:In/camunda:Out
  // add camunda:In/camunda:Out
  // change camundaIn source
  // change camundaIn sourceExpression
  // change camundaIn target
  // check target validation when source or sourceExpression is set
  // check to clear one inputField
  // undo/redo checks

});
