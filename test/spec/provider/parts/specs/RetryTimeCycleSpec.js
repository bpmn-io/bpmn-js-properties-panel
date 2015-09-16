'use strict';

var TestHelper = require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach');

describe('retry-time-cycle', function() {

  var diagramXML = require('../diagrams/RetryTimeCycleTest.bpmn');

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


  beforeEach(inject(function(commandStack) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);
  }));


  it('should fetch a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('BoundaryEvent'),
        inputEl = 'input[name=jobRetryTimeCycle]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var bo = getBusinessObject(shape),
        inputValue = domQuery(inputEl, propertiesPanel._container).value;

    // then
    var retryTimer = bo.get('extensionElements').get('values')[1];
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('asd');
  }));

  it('should set a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask'),
      inputEl = 'input[name=jobRetryTimeCycle]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncField = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        retryField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerEvent(asyncField, 'click');

    TestHelper.triggerValue(retryField, 'foo', 'change');

    var bo = getBusinessObject(shape),
      inputValue = domQuery(inputEl, propertiesPanel._container).value;

    // then
    var retryTimer = bo.get('extensionElements').get('values')[0];
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('foo');
  }));

  it('should remove a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('BoundaryEvent'),
      inputEl = 'input[name=jobRetryTimeCycle]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputValue = domQuery(inputEl, propertiesPanel._container);

    var retryTimerArrayOld = getBusinessObject(shape).get('extensionElements').get('values').length;

    TestHelper.triggerValue(inputValue, '', 'change');

    var retryTimerArray = getBusinessObject(shape).get('extensionElements').get('values').length;

    // then
    expect(retryTimerArray).to.equal(1);
    expect(retryTimerArrayOld - 1).to.equal(retryTimerArray);
    expect(inputValue.value).to.equal('');
  }));
});
