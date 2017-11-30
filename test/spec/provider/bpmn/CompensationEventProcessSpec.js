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
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    find = require('lodash/collection/find'),
    eventDefinitionHelper = require('../../../../lib/helper/EventDefinitionHelper');


function getGeneralTab(container) {
  return domQuery('div[data-tab="general"]', container);
}

function getGroup(container, groupId) {
  var tab = getGeneralTab(container);
  return domQuery('div[data-group="' + groupId + '"]', tab);
}

function getEntry(container, groupId, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getGroup(container, groupId));
}

function getSelectField(container, groupId, entryId, selectName) {
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, getEntry(container, groupId, entryId));
}

function getCheckBoxFiled(container, groupId, entryId, checkboxName) {
  var selector = 'input[type="checkbox"]' + (checkboxName ? '[name="' + checkboxName + '"]' : '');
  return domQuery(selector, getEntry(container, groupId, entryId));
}

function getActivityRefSelect(container) {
  return getSelectField(container, 'details', 'activity-ref');
}

function selectActivityRef(type, container) {
  var select = getActivityRefSelect(container);
  var option = find(select.options, function(o) {
    return o.value === type;
  });
  option.selected  = 'selected';
  TestHelper.triggerEvent(select, 'change');
}

function getWaitForCompletionCheckBox(container) {
  return getCheckBoxFiled(container, 'details', 'wait-for-completion');
}

var isContainedIn = function(values, value) {
  return find(values, function(elem) {
    return elem.value === value;
  });
};

describe('compensation-event-process', function() {

  var diagramXML = require('./CompensationEventProcess.bpmn');

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


  it('should check activityRef property list of a throwing compensation event', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateThrowEvent_1f51k5d');

    // when
    selection.select(shape);

    // then
    var selectBox = getActivityRefSelect(propertiesPanel._container);
    expect(selectBox.options).to.have.length(6);
    expect(isContainedIn(selectBox.options, 'SubProcess')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'SUBPROCESS_WITH_NESTED_EVENT_SUB')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'subProcessNotTriggeredByEvent')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'withCompensationBoundaryEvent')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'callActivity')).to.be.ok;
    expect(isContainedIn(selectBox.options, '')).to.be.ok;
  }));

  it('should check activityRef property list of a throwing compensation event in a sub process', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('EndEvent_0eh4ei9');

    // when
    selection.select(shape);

    // then
    var selectBox = getActivityRefSelect(propertiesPanel._container);
    expect(selectBox.options).to.have.length(2);
    expect(isContainedIn(selectBox.options, 'A_TASK')).to.be.ok;
    expect(isContainedIn(selectBox.options, '')).to.be.ok;
  }));


  it('should check activityRef property list of a throwing compensation event in a event sub process', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CompensationEndEvent_19qhaq3');

    // when
    selection.select(shape);

    // then
    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container);
    expect(selectBox.options).to.have.length(7);
    expect(isContainedIn(selectBox.options, 'SUBPROCESS_WITH_NESTED_EVENT_SUB')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'SubProcess')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'eventSubProcessTask')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'subProcessNotTriggeredByEvent')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'withCompensationBoundaryEvent')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'callActivity')).to.be.ok;
    expect(isContainedIn(selectBox.options, '')).to.be.ok;
  }));

  it('should check activityRef property list of a throwing compensation event in a nested event sub process', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Z');

    // when
    selection.select(shape);

    // then
    var selectBox = getActivityRefSelect(propertiesPanel._container);
    expect(selectBox.options).to.have.length(4);
    expect(isContainedIn(selectBox.options, 'X')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'A')).to.be.ok;
    expect(isContainedIn(selectBox.options, 'B')).to.be.ok;
    expect(isContainedIn(selectBox.options, '')).to.be.ok;
  }));


  describe('fetch properties', function() {

    var activityRefSelectBox, waitForCompletionCheckbox;

    beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('IntermediateThrowEvent_0jzdpvk');
      selection.select(shape);

      var container = propertiesPanel._container;
      activityRefSelectBox = getActivityRefSelect(container);
      waitForCompletionCheckbox = getWaitForCompletionCheckBox(container);
    }));

    it('should show the wait for completion check box as checked', function() {
      // then
      expect(waitForCompletionCheckbox.checked).to.be.false;
    });


    it('should show the referenced activity', function() {
      // then
      expect(activityRefSelectBox.value).to.equal('callActivity');
    });

  });


  describe('change wait for completion property', function() {

    var waitForCompletionCheckbox, bo, compensateEventDefinition;

    describe('from checked to unchecked', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
        // given
        var shape = elementRegistry.get('IntermediateThrowEvent_0jzdpvk');
        bo = getBusinessObject(shape);
        compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(bo);

        selection.select(shape);

        var container = propertiesPanel._container;
        waitForCompletionCheckbox = getWaitForCompletionCheckBox(container);

        // when
        TestHelper.triggerEvent(waitForCompletionCheckbox, 'click');
      }));

      describe('on the business object', function() {

        it('should execute', function() {
          expect(compensateEventDefinition.get('waitForCompletion')).to.be.true;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(compensateEventDefinition.get('waitForCompletion')).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(compensateEventDefinition.get('waitForCompletion')).to.be.true;
        }));

      });


      describe('in the DOM', function() {

        it('should execute', function() {
          expect(waitForCompletionCheckbox.checked).to.be.true;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(waitForCompletionCheckbox.checked).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(waitForCompletionCheckbox.checked).be.true;
        }));

      });

    });


    describe('from uncheck to checked', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
        // given
        var shape = elementRegistry.get('IntermediateThrowEvent_1f51k5d');
        bo = getBusinessObject(shape);
        compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(bo);

        selection.select(shape);

        var container = propertiesPanel._container;
        waitForCompletionCheckbox = getWaitForCompletionCheckBox(container);

        // when
        TestHelper.triggerEvent(waitForCompletionCheckbox, 'click');
      }));

      describe('on the business object', function() {

        it('should execute', function() {
          expect(compensateEventDefinition.get('waitForCompletion')).to.be.ok;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(compensateEventDefinition.get('waitForCompletion')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(compensateEventDefinition.get('waitForCompletion')).to.be.ok;
        }));

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(waitForCompletionCheckbox.checked).to.be.ok;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(waitForCompletionCheckbox.checked).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(waitForCompletionCheckbox.checked).to.be.ok;
        }));

      });

    });

  });


  describe('change activity', function() {

    var activityRefSelectBox, bo, compensateEventDefinition;

    describe('from undefined to an activity', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
        // given
        var shape = elementRegistry.get('IntermediateThrowEvent_1f51k5d');
        bo = getBusinessObject(shape);
        compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(bo);

        selection.select(shape);

        var container = propertiesPanel._container;
        activityRefSelectBox = getActivityRefSelect(container);

        // when
        selectActivityRef('callActivity', container);
      }));

      describe('on the business object', function() {

        it('should execute', function() {
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('callActivity');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(compensateEventDefinition.get('activityRef')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('callActivity');
        }));

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(activityRefSelectBox.value).to.equal('callActivity');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(activityRefSelectBox.value).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(activityRefSelectBox.value).to.equal('callActivity');
        }));

      });

    });

    describe('from an activity to another activity', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
        // given
        var shape = elementRegistry.get('IntermediateThrowEvent_0jzdpvk');
        bo = getBusinessObject(shape);
        compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(bo);

        selection.select(shape);

        var container = propertiesPanel._container;
        activityRefSelectBox = getActivityRefSelect(container);

        // when
        selectActivityRef('SubProcess', container);
      }));

      describe('on the business object', function() {

        it('should execute', function() {
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('SubProcess');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('callActivity');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('SubProcess');
        }));

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(activityRefSelectBox.value).to.equal('SubProcess');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(activityRefSelectBox.value).to.equal('callActivity');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(activityRefSelectBox.value).to.equal('SubProcess');
        }));

      });

    });


    describe('from an activity to undefined', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
        // given
        var shape = elementRegistry.get('IntermediateThrowEvent_0jzdpvk');
        bo = getBusinessObject(shape);
        compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(bo);

        selection.select(shape);

        var container = propertiesPanel._container;
        activityRefSelectBox = getActivityRefSelect(container);

        // when
        selectActivityRef('', container);
      }));

      describe('on the business object', function() {

        it('should execute', function() {
          expect(compensateEventDefinition.get('activityRef')).not.to.be.ok;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(compensateEventDefinition.get('activityRef')).to.be.ok;
          expect(compensateEventDefinition.get('activityRef').id).to.equal('callActivity');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(compensateEventDefinition.get('activityRef')).not.to.be.ok;
        }));

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(activityRefSelectBox.value).not.to.be.ok;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          //then
          expect(activityRefSelectBox.value).to.equal('callActivity');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(activityRefSelectBox.value).not.to.be.ok;
        }));

      });

    });

  });

});
