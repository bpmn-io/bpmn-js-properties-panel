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

describe('Version-Tag', function() {

  var diagramXML = require('./VersionTagParticipant.bpmn');

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

  it('should add attribute when not empty on processRef', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('Participant_2'),
        inputEl = 'input[name=versionTag]';

      // given
    selection.select(shape);
    var bo = getBusinessObject(shape).get('processRef'),
        inputElement = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerValue(inputElement, '', 'change');

      // when
    TestHelper.triggerValue(inputElement, '1.0.2', 'change');

      // then
    expect(bo.get('camunda:versionTag')).to.equal('1.0.2');
  }));

  it('should fetch the value of the attribute on processRef', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('Participant_1');

      // when
    selection.select(shape);
    var bo = getBusinessObject(shape).get('processRef');

      // then
    expect(bo.get('camunda:versionTag')).to.equal('1.0.0');
  }));

  it('should modify the value of the attribute on processRef', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('Participant_1'),
        inputEl = 'input[name=versionTag]';

      // given
    selection.select(shape);
    var bo = getBusinessObject(shape).get('processRef'),
        inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
    TestHelper.triggerValue(inputElement, '1.0.2', 'change');

      // then
    expect(bo.get('camunda:versionTag')).to.equal('1.0.2');
  }));

  it('should remove attribute from processRef when value is empty', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape   = elementRegistry.get('Participant_1'),
        inputEl = 'input[name=versionTag]';

      // given
    selection.select(shape);

    var bo         = getBusinessObject(shape).get('processRef'),
        inputElement = domQuery(inputEl, propertiesPanel._container);

      // when
    TestHelper.triggerValue(inputElement, '', 'change');

      // then
    expect(bo.get('camunda:versionTag')).to.be.undefined;
  }));


  it('should add attribute to processRef when the remove is undone', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape   = elementRegistry.get('Participant_1'),
        inputEl = 'input[name=versionTag]';


    selection.select(shape);

    var bo         = getBusinessObject(shape).get('processRef'),
        inputElement = domQuery(inputEl, propertiesPanel._container);

      // given
    TestHelper.triggerValue(inputElement, '', 'change');

      // when
    commandStack.undo();
    var versionTagField = bo.get('camunda:versionTag');

      // then
    expect(versionTagField).not.to.be.undefined;
    expect(versionTagField).to.equal('1.0.0');
  }));

});
