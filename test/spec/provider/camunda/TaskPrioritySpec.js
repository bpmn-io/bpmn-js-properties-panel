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

describe('Task Priority', function() {

  var diagramXML = require('./TaskPriority.bpmn');

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

  describe('Process', function() {

    it('should add attribute when not empty', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);
      var bo = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      TestHelper.triggerValue(inputElement, '', 'change');

      // when
      TestHelper.triggerValue(inputElement, '300', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('300');
    }));


    it('should fetch the value of the attribute', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Process_1');

      // when
      selection.select(shape);
      var bo = getBusinessObject(shape);

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('100');
    }));


    it('should modify the value of the attribute', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);
      var bo = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
      TestHelper.triggerValue(inputElement, '300', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('300');
    }));


    it('should remove attribute when value is empty', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape   = elementRegistry.get('Process_1'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);

      var bo         = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
      TestHelper.triggerValue(inputElement, '', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.be.undefined;
    }));


    it('should add attribute when the remove is undone', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

      var shape   = elementRegistry.get('Process_1'),
          inputEl = 'input[name=taskPriority]';


      selection.select(shape);

      var bo         = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // given
      TestHelper.triggerValue(inputElement, '', 'change');

      // when
      commandStack.undo();
      var taskPriority = bo.get('camunda:taskPriority');

      // then
      expect(taskPriority).not.to.be.undefined;
      expect(taskPriority).to.equal('100');
    }));

  });


  describe('ServiceTaskLike Element', function() {

    it('should add attribute when not empty', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('serviceTask'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);
      var bo = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      TestHelper.triggerValue(inputElement, '', 'change');

      // when
      TestHelper.triggerValue(inputElement, '300', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('300');
    }));


    it('should fetch the value of the attribute', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('serviceTask');

      // when
      selection.select(shape);
      var bo = getBusinessObject(shape);

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('100');
    }));


    it('should modify the value of the attribute', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('serviceTask'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);
      var bo = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
      TestHelper.triggerValue(inputElement, '300', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.equal('300');
    }));


    it('should remove attribute when value is empty', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape   = elementRegistry.get('serviceTask'),
          inputEl = 'input[name=taskPriority]';

      // given
      selection.select(shape);

      var bo         = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
      TestHelper.triggerValue(inputElement, '', 'change');

      // then
      expect(bo.get('camunda:taskPriority')).to.be.undefined;
    }));


    it('should add attribute when the remove is undone', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

      var shape   = elementRegistry.get('serviceTask'),
          inputEl = 'input[name=taskPriority]';


      selection.select(shape);

      var bo         = getBusinessObject(shape),
          inputElement = domQuery(inputEl, propertiesPanel._container);

      // given
      TestHelper.triggerValue(inputElement, '', 'change');

      // when
      commandStack.undo();
      var taskPriority = bo.get('camunda:taskPriority');

      // then
      expect(taskPriority).not.to.be.undefined;
      expect(taskPriority).to.equal('100');
    }));

  });

});
