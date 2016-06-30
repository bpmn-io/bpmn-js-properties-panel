'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');


describe('camunda-properties', function() {

  var diagramXML = require('./CamundaPropertiesProvider-JobConfiguration.bpmn');

  var testModules = [
    coreModule,
    selectionModule,
    modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: {
      camunda: camundaModdlePackage
    }
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


  it('should hide the job configuration group when all items are hidden or empty', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask_1'),
        selector = '[data-group=jobConfiguration]';

    // when
    selection.select(shape);

    var group = domQuery(selector, propertiesPanel._container);

    // then
    expect(domClasses(group).has('bpp-hidden')).to.be.true;
  }));


  it('should show the job configuration group when there is a non hidden group element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1'),
        groupSelector = '[data-group=jobConfiguration]',
        inputSelector = 'div[data-entry=asyncBefore] input[name=asyncBefore]';

      // given
    selection.select(shape);

    var asyncBeforeCheckbox = domQuery(inputSelector, propertiesPanel._container);

      // when
    TestHelper.triggerEvent(asyncBeforeCheckbox, 'click');
    var group = domQuery(groupSelector, propertiesPanel._container);

      // then
    expect(domClasses(group).has('bpp-hidden')).to.be.false;
  }));

});
