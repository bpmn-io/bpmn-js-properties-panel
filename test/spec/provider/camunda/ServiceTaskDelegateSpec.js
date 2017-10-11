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

describe('service-task-delegate-properties', function() {

  var diagramXML = require('./ServiceTaskDelegate.bpmn');

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


  it('should fill expression property',
    inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      // select 'delegateExpression'
      delegateOption.options[2].selected  = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');
      TestHelper.triggerValue(delegateInput, 'foo');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('class')).to.be.undefined;
      expect(taskBo.get('camunda:delegateExpression')).to.equal('foo');
    })
  );


  it('should fill delegate expression property',
    inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      // select 'expression'
      delegateOption.options[1].selected = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');
      TestHelper.triggerValue(delegateInput, 'foo');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('camunda:expression')).to.equal('foo');
    })
  );


  it('should fill class property',
    inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      // select 'class'
      delegateOption.options[0].selected = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');
      TestHelper.triggerValue(delegateInput, 'foo');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('class')).to.equal('foo');
    })
  );


  it('should remove all other properties in a mutuable choice',
    inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      // select 'expression'
      delegateOption.options[1].selected = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');
      TestHelper.triggerValue(delegateInput, 'foo');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('camunda:expression')).to.equal('foo');
      expect(taskBo.get('camunda:class')).to.be.undefined;
      expect(taskBo.get('camunda:delegateExpression')).to.be.undefined;

      expect(domQuery.all('select[name=implType]', propertiesPanel._container).length).to.equal(1);
      expect(TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)).value).to.equal('expression');
      expect(TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)).value).not.to.equal('class');
    })
  );


  it('should remove all other properties in a mutuable choice when first changing the input', inject(
    function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('ServiceTask_2');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      TestHelper.triggerValue(delegateInput, 'foo');
      // select 'expression'
      delegateOption.options[1].selected = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('camunda:expression')).to.equal('foo');
      expect(taskBo.get('camunda:class')).to.be.undefined;
      expect(taskBo.get('camunda:delegateExpression')).to.be.undefined;

      expect(domQuery.all('select[name=implType]', propertiesPanel._container).length).to.equal(1);
      expect(TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)).value).to.equal('expression');
      expect(TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)).value).not.to.equal('class');
    }
  ));


  it('should apply an empty string to a property', inject(
    function(propertiesPanel, selection, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      selection.select(taskShape);

      var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
      var delegateOption = domQuery('select[name=implType]', propertiesPanel._container);

      // if
      // select 'class'
      delegateOption.options[0].selected = 'selected';
      TestHelper.triggerEvent(delegateOption, 'change');
      TestHelper.triggerValue(delegateInput, '');

      // then
      var taskBo = getBusinessObject(taskShape);
      expect(taskBo.get('camunda:class')).to.equal('');
      expect(taskBo.get('camunda:expression')).to.be.undefined;
      expect(taskBo.get('camunda:delegateExpression')).to.be.undefined;
    }
  ));


  it('should change implementation type from Expression to Java Class for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_2');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        delegateField = domQuery('input[name="delegate"]', propertiesPanel._container),
        resVarField = domQuery('input[name=resultVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('expression');
    expect(delegateField.value).to.equal('BAR');
    expect(businessObject.get('camunda:expression')).to.equal(delegateField.value);
    expect(resVarField.value).to.equal('resVar');
    expect(businessObject.get('camunda:resultVariable')).to.equal(resVarField.value);

    // when
    // select option 'class'
    implType.options[0].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    expect(implType.value).to.equal('class');
    expect(businessObject).to.have.property('class');
    expect(businessObject.get('camunda:expression')).to.be.undefined;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
    expect(businessObject.get('camunda:delegateExpression')).to.be.undefined;
  }));


  it('should remove delegate value field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_2');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        delegateField = domQuery('input[name="delegate"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=delegate] button[data-action=clear]',
                                propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('expression');
    expect(delegateField.value).to.equal('BAR');
    expect(businessObject.get('camunda:expression')).to.equal(delegateField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    var errorMessage = domQuery('[data-entry=delegate] div[class=bpp-error-message]', propertiesPanel._container);
    expect(errorMessage.textContent).to.equal('Must provide a value');

    expect(implType.value).to.equal('expression');
    expect(businessObject).to.have.property('expression');
    expect(delegateField.className).to.equal('invalid');
    expect(businessObject.get('camunda:delegateExpression')).to.be.undefined;
    expect(businessObject.get('camunda:class')).to.be.undefined;
  }));


  it('should add service task properties without adding undefined DMN or external properties', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_Empty');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        delegateField = domQuery('input[name="delegate"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('');
    expect(businessObject.get('camunda:expression')).to.not.exist;
    expect(businessObject.get('camunda:class')).to.not.exist;
    expect(businessObject.get('camunda:delegateExpression')).to.not.exist;

    // select 'expression'
    implType.options[1].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(delegateField, 'foo');

    expect(implType.value).to.equal('expression');
    expect(delegateField.value).to.equal('foo');
    expect(businessObject.get('camunda:topic')).to.be.undefined;
    expect(businessObject.get('camunda:type')).to.be.undefined;
    expect(businessObject).not.to.have.property('decisionRef');
    expect(businessObject).not.to.have.property('decisionRefBinding');
    expect(businessObject).not.to.have.property('decisionRefVersion');

    businessObject.$model.toXML(businessObject, { format:true }, function(err, xml) {
      expect(xml).to.contain('camunda:expression="' + delegateField.value + '"');
      expect(xml).not.to.contain('camunda:class');
      expect(xml).not.to.contain('camunda:delegateExpression');
      expect(xml).not.to.contain('camunda:topic');
      expect(xml).not.to.contain('camunda:type');
      expect(xml).not.to.contain('camunda:decisionRef');
      expect(xml).not.to.contain('camunda:decisionRefVersion');
      expect(xml).not.to.contain('camunda:decisionRefBinding');
    });
  }));


  it('should have an error message when changing implementation type from Expression to Java Class for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_Empty');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        delegateField = domQuery('input[name="delegate"]', propertiesPanel._container);

    // given
    expect(implType.value).to.be.empty;

    // when
    // select implType 'expression'
    implType.options[1].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    expect(delegateField.value).to.be.empty;
    expect(delegateField.className).to.equal('invalid');

    var errorMessage = domQuery('[data-entry=delegate] div[class=bpp-error-message]', propertiesPanel._container);
    expect(errorMessage.textContent).to.equal('Must provide a value');

    // when
    // select implType 'class'
    implType.options[0].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    errorMessage = domQuery('[data-entry=delegate] div[class=bpp-error-message]', propertiesPanel._container);
    expect(errorMessage).to.exist;

  }));

});
