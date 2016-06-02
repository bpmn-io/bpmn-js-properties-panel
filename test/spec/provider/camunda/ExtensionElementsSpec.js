'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('extensionElements', function() {

  var diagramXML = require('./ExtensionElements.bpmn');

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
    modules : testModules,
    moddleExtensions : { camunda : camundaModdlePackage }
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


  it('should remove list when there is no child element left', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape   = elementRegistry.get('BoundaryEvent'),
        inputEl = 'input[name=cycle]';

      // given
    selection.select(shape);

    var bo         = getBusinessObject(shape),
        inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
    TestHelper.triggerValue(inputElement, '', 'change');

      // then
    expect(bo.get('extensionElements')).to.be.undefined;
  }));


  it('should add list when the remove is undone', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape   = elementRegistry.get('BoundaryEvent'),
        inputEl = 'input[name=cycle]';


    selection.select(shape);

    var bo         = getBusinessObject(shape),
        inputElement = domQuery(inputEl, propertiesPanel._container);

      // given
    TestHelper.triggerValue(inputElement, '', 'change');

      // when
    commandStack.undo();
    var eE = bo.get('extensionElements');

      // then
    expect(eE).not.to.be.undefined;
    expect(eE.get('values').length).to.equal(1);
    expect(eE.get('values')[0].body).to.equal('asd');
  }));

});
