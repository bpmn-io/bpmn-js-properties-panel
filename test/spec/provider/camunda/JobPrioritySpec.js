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

describe('jobPriority', function() {
  var diagramXML = require('./JobPriority.bpmn');

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
    moddleExtensions: { camunda: camundaModdlePackage }
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


  it('should fetch a job priority for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask'),
        inputEl = 'input[name=jobPriority]';

    // when
    selection.select(shape);
    var bo = getBusinessObject(shape),
        inputValue = domQuery(inputEl, propertiesPanel._container).value;

    // then
    expect(bo.get('jobPriority')).to.equal(inputValue);
  }));


  it('should set a job priority on an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent'),
        inputEl = 'input[name=jobPriority]';

    // given
    selection.select(shape);

    var inputElement = domQuery(inputEl, propertiesPanel._container),
        bo = getBusinessObject(shape);

    // when
    TestHelper.triggerValue(inputElement, '100', 'change');

    // then
    expect(bo.get('jobPriority')).to.equal('100');
  }));


  it('should get the job priority of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2'),
        inputEl = 'input[name=jobPriority]';

    // when
    selection.select(shape);

    var prio = domQuery(inputEl, propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('jobPriority')).to.equal(prio.value);
  }));


  it('should set the job priority of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2'),
        inputEl = 'input[name=jobPriority]';

    selection.select(shape);

    var inputElement = domQuery(inputEl, propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerValue(inputElement, 'Foo', 'change');

    // then
    expect(shapeBo.get('jobPriority')).to.equal('Foo');
  }));

});
