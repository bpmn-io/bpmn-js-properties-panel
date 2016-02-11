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
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  find = require('lodash/collection/find'),
  forEach = require('lodash/collection/forEach');

describe('extension-properties', function() {

  var diagramXML = require('./ExtensionProperties.bpmn');

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

  function getProperties(extensionElements) {
    var camundaProperties = [];
    if (!!extensionElements && !!extensionElements.values) {
      var properties = find(extensionElements.values, function(value) {
        return is(value, 'camunda:Properties');
      });
      if (properties) {
        forEach(properties.values, function(param) {
          camundaProperties.push(param);
        });        
      }
    }
    return camundaProperties;
  }


  it('should display an empty input parameters selection box',
    inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Collaboration_1');

    // when
    selection.select(shape);

    // then
    var propertiesSelection = domQuery('select[id=cam-extension-elements-properties]', propertiesPanel._container);

    expect(propertiesSelection.options.length).to.equal(0);
  }));


  it('should add a new property',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Collaboration_1');
    selection.select(shape);

    var bo = getBusinessObject(shape);

    var addPropertyButton = domQuery('div[id=cam-extension-elements-properties] button[id=newElementAction]', propertiesPanel._container);

    // when
    TestHelper.triggerEvent(addPropertyButton, 'click');

    // then
    var propertiesSelection     = domQuery('select[id=cam-extension-elements-properties]', propertiesPanel._container),
        propertyNameInput  = domQuery('input[id=camunda-property-name]', propertiesPanel._container),
        propertyTextValue  = domQuery('textarea[id=camunda-property-value]', propertiesPanel._container);

    expect(propertiesSelection.options.length).to.equal(1);
    expect(propertiesSelection.options[0].selected).to.equal(true);
    expect(propertyNameInput.value).to.equal(propertiesSelection.value);
    expect(propertyTextValue.value).to.equal('');

    var properties = getProperties(bo.extensionElements);
    expect(properties.length).to.equal(1);
  }));


  it('should undo adding a property',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var shape = elementRegistry.get('Collaboration_1');
    selection.select(shape);

    var addPropertyButton = domQuery('div[id=cam-extension-elements-properties] button[id=newElementAction]', propertiesPanel._container);
    TestHelper.triggerEvent(addPropertyButton, 'click');

    var bo = getBusinessObject(shape);
    var properties = getProperties(bo.extensionElements);

    // assume
    var propertiesSelection = domQuery('select[id=cam-extension-elements-properties]', propertiesPanel._container);
    expect(propertiesSelection.options.length).to.equal(1);
    expect(properties.length).to.equal(1);

    // when
    commandStack.undo();

    // then
    expect(propertiesSelection.options.length).to.equal(0);

    properties = getProperties(bo.extensionElements);
    expect(properties.length).to.equal(0);
  }));

});
