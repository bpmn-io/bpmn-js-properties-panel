'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('prcoess-root-process-properties', function() {

  var diagramXML = require('./ProcessRoot.bpmn');

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
    modules: testModules
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


  it('should set the isExecutable property of a process', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('Process_1');

    selection.select(shape);
    var isExecutable = domQuery('input[name=isExecutable]', propertiesPanel._container),
        taskBo        = getBusinessObject(shape);

    // given
    expect(taskBo.get('isExecutable')).to.not.be.ok;

    // when
    TestHelper.triggerEvent(isExecutable, 'click');

    // then
    expect(taskBo.get('isExecutable')).to.be.ok;
  }));


  it('should get the name of a process', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('Process_1');

    selection.select(shape);
    var name = domQuery('div[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape);

    expect(shapeBo.get('name')).to.equal(name.textContent);
  }));


  it('should set the name of a process', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('Process_1');
    selection.select(shape);
    var name = domQuery('div[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape);

    // given
    expect(shapeBo.get('name')).to.equal(name.textContent);

    // when
    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('name')).to.equal('Foo');
  }));
});
