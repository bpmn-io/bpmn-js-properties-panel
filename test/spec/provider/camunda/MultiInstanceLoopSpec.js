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
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var HIDE_CLASS = 'bpp-hidden';

function getMultiInstanceGroup(container) {
  return domQuery('div[data-group=multiInstance]', container);
}

function getEntry(container, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getMultiInstanceGroup(container));
}

function getInputField(container, entryId, inputName) {
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getLoopCardinalityInput(container) {
  return getInputField(container, 'multiInstance-loopCardinality', 'loopCardinality');
}

function getCollectionInput(container) {
  return getInputField(container, 'multiInstance-collection', 'collection');
}

function getElementVariableInput(container) {
  return getInputField(container, 'multiInstance-elementVariable', 'elementVariable');
}

function getCompletionConditionInput(container) {
  return getInputField(container, 'multiInstance-completionCondition', 'completionCondition');
}

function getErrorMessageEntry(container) {
  return getEntry(container, 'multiInstance-errorMessage');
}

function getAsyncBefore(container) {
  return getInputField(container, 'multiInstance-asyncBefore', 'asyncBefore');
}

function getAsyncAfter(container) {
  return getInputField(container, 'multiInstance-asyncAfter', 'asyncAfter');
}

function getExclusive(container) {
  return getInputField(container, 'multiInstance-exclusive', 'exclusive');
}

function getCycle(container) {
  return getInputField(container, 'multiInstance-retryTimeCycle', 'cycle');
}


describe('multiInstance-loop-properties', function() {

  var diagramXML = require('./MultiInstanceLoop.bpmn');

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

  describe('property controls', function() {

    var container, task, loopCharacteristics;

    beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      container = propertiesPanel._container;
      var shape = elementRegistry.get('ALL_PROPS_SET');
      task = getBusinessObject(shape);
      loopCharacteristics = task.get('loopCharacteristics');

      // when
      selection.select(shape);
    }));


    it('should fetch the loop cardinality', function() {
      // then
      var loopCardinality = loopCharacteristics.get('loopCardinality').get('body');

      expect(getLoopCardinalityInput(container).value).to.equal(loopCardinality);
    });


    it('should fetch the collection', function() {
      // then
      var collection = loopCharacteristics.get('camunda:collection');

      expect(getCollectionInput(container).value).to.equal(collection);
    });


    it('should fetch the element variable', function() {
      // then
      var elementVariable = loopCharacteristics.get('camunda:elementVariable');

      expect(getElementVariableInput(container).value).to.equal(elementVariable);
    });


    it('should fetch the completionCondition', function() {
      // then
      var completionCondition = loopCharacteristics.get('completionCondition').get('body');

      expect(getCompletionConditionInput(container).value).to.equal(completionCondition);
    });

  });


  describe('validation', function() {

    var container;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('WITHOUT_COMPLETION_CONDITION');

      // when
      selection.select(shape);


    }));

    it('should show validation error', function() {

      // then
      expect(getErrorMessageEntry(container).className).not.to.contain(HIDE_CLASS);
    });


    it('should hide validation error when adding a loop cardinality', function() {

      // when
      TestHelper.triggerValue(getLoopCardinalityInput(container), '111', 'change');

      // then
      expect(getErrorMessageEntry(container).className).to.contain(HIDE_CLASS);
    });


    it('should hide validation error when adding a collection', function() {

      // when
      TestHelper.triggerValue(getCollectionInput(container), '111', 'change');

      // then
      expect(getErrorMessageEntry(container).className).to.contain(HIDE_CLASS);
    });


    it('should show validation on collection property when adding an element variable', function() {

      // when
      TestHelper.triggerValue(getElementVariableInput(container), '111', 'change');

      // then
      expect(getCollectionInput(container).className).to.contain('invalid');
      expect(getErrorMessageEntry(container).className).not.to.contain(HIDE_CLASS);
    });

  });

  describe('loop cardinality', function() {

    var container, task, loopCharacteristics, input;

    describe('change loop cardinality', function() {

      var loopCardinality;

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');
        loopCardinality = loopCharacteristics.get('loopCardinality');

        selection.select(shape);

        input = getLoopCardinalityInput(container);

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('10');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCardinality.get('body')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCardinality.get('body')).to.equal('10');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCardinality.get('body')).to.equal('999');
        }));

      });

    });


    describe('add loop cardinality', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ServiceTask3');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getLoopCardinalityInput(container);

        // assume
        expect(loopCharacteristics.get('loopCardinality')).not.to.be.ok;

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('loopCardinality')).to.be.ok;
          expect(loopCharacteristics.get('loopCardinality').get('body')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('loopCardinality')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('loopCardinality')).to.be.ok;
          expect(loopCharacteristics.get('loopCardinality').get('body')).to.equal('999');
        }));

      });

    });


    describe('remove loop cardinality', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getLoopCardinalityInput(container);

        // assume
        expect(loopCharacteristics.get('loopCardinality')).to.be.ok;

        // when
        TestHelper.triggerValue(input, '', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('10');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('loopCardinality')).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('loopCardinality')).to.be.ok;
          expect(loopCharacteristics.get('loopCardinality').get('body')).to.equal('10');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('loopCardinality')).not.to.be.ok;
        }));

      });

    });

  });


  describe('collection', function() {

    var container, task, loopCharacteristics, input;

    describe('change collection', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getCollectionInput(container);

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:collection')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).to.equal('999');
        }));

      });

    });


    describe('add collection', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ServiceTask');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getCollectionInput(container);

        // assume
        expect(loopCharacteristics.get('camunda:collection')).not.to.be.ok;

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:collection')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).to.equal('999');
        }));

      });

    });


    describe('remove collection', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getCollectionInput(container);

        // assume
        expect(loopCharacteristics.get('camunda:collection')).to.equal('foo');

        // when
        TestHelper.triggerValue(input, '', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:collection')).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:collection')).not.to.be.ok;
        }));

      });

    });

  });


  describe('element variable', function() {

    var container, task, loopCharacteristics, input;

    describe('change collection', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getElementVariableInput(container);

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('999');
        }));

      });

    });


    describe('add element variable', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ServiceTask');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getElementVariableInput(container);

        // assume
        expect(loopCharacteristics.get('camunda:elementVariable')).not.to.be.ok;

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('999');
        }));

      });

    });


    describe('remove element variable', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getElementVariableInput(container);

        // assume
        expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('bar');

        // when
        TestHelper.triggerValue(input, '', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('camunda:elementVariable')).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).to.equal('bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('camunda:elementVariable')).not.to.be.ok;
        }));

      });

    });

  });


  describe('completion condition', function() {

    var container, task, loopCharacteristics, input;

    describe('change completion condition', function() {

      var completionCondition;

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');
        completionCondition = loopCharacteristics.get('completionCondition');

        selection.select(shape);

        input = getCompletionConditionInput(container);

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('foo=bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(completionCondition.get('body')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(completionCondition.get('body')).to.equal('foo=bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(completionCondition.get('body')).to.equal('999');
        }));

      });

    });


    describe('add completion condition', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('WITHOUT_COMPLETION_CONDITION');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getCompletionConditionInput(container);

        // assume
        expect(loopCharacteristics.get('completionCondition')).not.to.be.ok;

        // when
        TestHelper.triggerValue(input, '999', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('999');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('completionCondition')).to.be.ok;
          expect(loopCharacteristics.get('completionCondition').get('body')).to.equal('999');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('completionCondition')).not.to.be.ok;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('completionCondition')).to.be.ok;
          expect(loopCharacteristics.get('completionCondition').get('body')).to.equal('999');
        }));

      });

    });


    describe('remove completion condition', function() {

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('ALL_PROPS_SET');
        task = getBusinessObject(shape);
        loopCharacteristics = task.get('loopCharacteristics');

        selection.select(shape);

        input = getCompletionConditionInput(container);

        // assume
        expect(loopCharacteristics.get('completionCondition')).to.be.ok;

        // when
        TestHelper.triggerValue(input, '', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('foo=bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          expect(loopCharacteristics.get('completionCondition')).not.to.be.ok;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(loopCharacteristics.get('completionCondition')).to.be.ok;
          expect(loopCharacteristics.get('completionCondition').get('body')).to.equal('foo=bar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(loopCharacteristics.get('completionCondition')).not.to.be.ok;
        }));

      });

    });

  });


  it('should fetch the multi instance async before property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = getAsyncBefore(propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(!!businessObject.get('asyncBefore'));
    expect(input.checked).to.be.ok;
  }));


  it('should set the multi instance async before property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = getAsyncBefore(propertiesPanel._container);

    // given
    expect(input.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // then
    expect(businessObject.get('asyncBefore')).to.not.be.ok;
    expect(input.checked).to.not.be.ok;
  }));


  it('should fetch the multi instance async after property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = getAsyncAfter(propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(!!businessObject.get('asyncAfter'));
    expect(input.checked).to.not.be.ok;
  }));


  it('should set the multi instance async after property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');
    var input = getAsyncAfter(propertiesPanel._container);

    // given
    expect(input.checked).to.not.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    // then
    expect(businessObject.get('asyncBefore')).to.be.ok;
    expect(input.checked).to.be.ok;
  }));


  it('should fetch the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = getExclusive(propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(businessObject.get('exclusive'));
  }));


  it('should set the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = getExclusive(propertiesPanel._container);
    var  businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(input.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    // then
    expect(input.checked).to.equal(businessObject.get('exclusive'));
    expect(businessObject.get('exclusive')).to.not.be.ok;
  }));


  it('should reset the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var exclusiveInput = getExclusive(propertiesPanel._container),
        asyncBeforeInput = getAsyncBefore(propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(exclusiveInput.checked).to.be.ok;
    expect(asyncBeforeInput.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(exclusiveInput, 'click'); // change the value of the exclusive field
    TestHelper.triggerEvent(asyncBeforeInput, 'click'); // reset the exclusive field

    // then
    expect(exclusiveInput.checked).to.equal(businessObject.get('exclusive'));
    expect(businessObject.get('exclusive')).to.be.ok;
  }));


  it('should hide the exclusive box when disabled', inject(function(propertiesPanel, selection, elementRegistry) {
      // given
    var shape = elementRegistry.get('ServiceTask4');

      // when
    selection.select(shape);

    var exclusiveEntry = getExclusive(propertiesPanel._container);

      // then
    expect(domClasses(exclusiveEntry).has(HIDE_CLASS)).to.be.true;

  }));


  it('should show the exclusive box when async before or async after are enabled', inject(function(propertiesPanel, selection, elementRegistry) {
    var shape = elementRegistry.get('ServiceTask4');

      // given
    selection.select(shape);
    var asyncBeforeInput = getAsyncBefore(propertiesPanel._container),
        exclusiveEntry = getExclusive(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(asyncBeforeInput, 'click');

      // then
    expect(domClasses(exclusiveEntry).has(HIDE_CLASS)).to.be.false;

  }));


  it('should update if loop markers are toggled', inject(function(propertiesPanel, elementRegistry, selection, moddle, modeling) {

    // given
    var shape = elementRegistry.get('ServiceTask2');
    selection.select(shape);

    // assume
    expect(getMultiInstanceGroup(propertiesPanel._container).className).to.contain(HIDE_CLASS);

    // when
    var loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');
    modeling.updateProperties(shape, { loopCharacteristics: loopCharacteristics });

    // then
    expect(getMultiInstanceGroup(propertiesPanel._container).className).not.to.contain(HIDE_CLASS);
  }));


  it('should fetch a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask3');

    // when
    selection.select(shape);

    var bo = getBusinessObject(shape).loopCharacteristics,
        inputValue = getCycle(propertiesPanel._container).value,
        retryTimer = bo.get('extensionElements').get('values')[1];

    // then
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('asd');
  }));


  it('should set a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask');
    var bo = getBusinessObject(shape).loopCharacteristics;

    selection.select(shape);

    var retryField = getCycle(propertiesPanel._container);

    // given
    expect(retryField.value).to.equal('');

    // when
    TestHelper.triggerValue(retryField, 'foo', 'change');

    var inputValue = getCycle(propertiesPanel._container).value,
        retryTimer = bo.get('extensionElements').get('values')[0];

    // then
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('foo');
  }));


  it('should remove a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask3');

    selection.select(shape);

    var inputValue = getCycle(propertiesPanel._container),
        retryTimerArrayOld = getBusinessObject(shape).loopCharacteristics.get('extensionElements').get('values').length;

    // given
    expect(inputValue.value).to.equal('asd');

    // when
    TestHelper.triggerValue(inputValue, '', 'change');

    var retryTimerArray = getBusinessObject(shape).loopCharacteristics.get('extensionElements').get('values').length;

    // then
    expect(retryTimerArray).to.equal(1);
    expect(retryTimerArrayOld - 1).to.equal(retryTimerArray);
    expect(inputValue.value).to.equal('');
  }));


  it('should hide the job retry time cycle field when disabled', inject(function(propertiesPanel, selection, elementRegistry) {
      // given
    var shape = elementRegistry.get('ServiceTask4');

      // when
    selection.select(shape);
    var jobRetryEntry = getCycle(propertiesPanel._container);

      // then
    expect(domClasses(jobRetryEntry.parentElement).has(HIDE_CLASS)).to.be.true;

  }));


  it('should show the job retry time cycle field when async before or async after are enabled', inject(function(propertiesPanel, selection, elementRegistry) {
    var shape = elementRegistry.get('ServiceTask4');

      // given
    selection.select(shape);
    var asyncBeforeInput = getAsyncBefore(propertiesPanel._container),
        jobRetryEntry = getCycle(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(asyncBeforeInput, 'click');

      // then
    expect(domClasses(jobRetryEntry.parentElement).has(HIDE_CLASS)).to.be.false;

  }));


  it('should remove the retryTimeCycle when the element is not async', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask3'),
        bo = getBusinessObject(shape).loopCharacteristics,
        extensionElementsCount = bo.get('extensionElements').get('values').length;

      // given
    selection.select(shape);
    var domElement = getAsyncBefore(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(domElement, 'click');
    var newCount = bo.get('extensionElements').get('values').length;

      // then
    expect(newCount + 1).to.equal(extensionElementsCount);
  }));


  it('should remove the retryTimeCycle and extensionElements list when the element is not async', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask5'),
        bo = getBusinessObject(shape).loopCharacteristics;

      // given
    selection.select(shape);
    var domElement = getAsyncBefore(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(domElement, 'click');

      // then
    expect(bo.get('extensionElements')).to.be.undefined;
  }));

});
