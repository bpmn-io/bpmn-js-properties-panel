'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/camunda'),
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach');

describe('retry-time-cycle', function() {

  var diagramXML = require('./RetryTimeCycle.bpmn');

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


  it('should fetch a retry time cycle for an element with timer def',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BoundaryEvent'),
        inputEl = 'input[name=jobRetryTimeCycle]';

    selection.select(shape);

    var bo = getBusinessObject(shape),
        inputValue = domQuery(inputEl, propertiesPanel._container).value;

    var retryTimer = bo.get('extensionElements').get('values')[1];

    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('asd');
  }));


  it('should set a retry time cycle for an element with timer def',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask'),
        inputEl = 'input[name=jobRetryTimeCycle]';
    var bo = getBusinessObject(shape);

    selection.select(shape);

    var asyncField = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        retryField = domQuery(inputEl, propertiesPanel._container);

    // given
    expect(asyncField.checked).to.be.false;
    expect(retryField.value).to.equal('');

    // when
    TestHelper.triggerEvent(asyncField, 'click');

    TestHelper.triggerValue(retryField, 'foo', 'change');

    var inputValue = domQuery(inputEl, propertiesPanel._container).value;
    var retryTimer = bo.get('extensionElements').get('values')[0];

    // then
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('foo');
  }));


  it('should remove a retry time cycle for an element with timer def',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BoundaryEvent'),
        inputEl = 'input[name=jobRetryTimeCycle]';

    selection.select(shape);

    var inputValue = domQuery(inputEl, propertiesPanel._container);
    var retryTimerArrayOld = getBusinessObject(shape).get('extensionElements').get('values').length;

    // given
    expect(inputValue.value).to.equal('asd');

    // when
    TestHelper.triggerValue(inputValue, '', 'change');

    var retryTimerArray = getBusinessObject(shape).get('extensionElements').get('values').length;

    // then
    expect(retryTimerArray).to.equal(1);
    expect(retryTimerArrayOld - 1).to.equal(retryTimerArray);
    expect(inputValue.value).to.equal('');
  }));
});
