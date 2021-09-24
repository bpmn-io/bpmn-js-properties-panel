'use strict';

var TestHelper = require('../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject, sinon */



var propertiesPanelModule = require('lib'),
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    keyboardModule = require('diagram-js/lib/features/keyboard').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('./properties');


var domQuery = require('min-dom').query,
    domAttr = require('min-dom').attr,
    domify = require('min-dom').domify;

var entryFactory = require('../../lib/factory/EntryFactory');


describe('properties-panel', function() {

  var diagramXML = require('./test.bpmn');

  var testModules = [
    coreModule, selectionModule, keyboardModule,
    modelingModule, propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));


  beforeEach(inject(function(commandStack) {

    var button = document.createElement('button');
    button.textContent = 'UNDO';

    button.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(button);
  }));


  it('should attach to element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

  }));


  describe('updating', function() {

    it('should update on root added', inject(function(canvas, eventBus, propertiesPanel) {

      // given
      var spy = sinon.spy(propertiesPanel, 'update');

      var root = canvas.getRootElement();

      // when
      eventBus.fire('root.added', {
        element: root
      });

      // expect
      expect(spy).to.have.been.called;
    }));


    it('should not update on implicit root added', inject(function(eventBus, propertiesPanel) {

      // given
      var spy = sinon.spy(propertiesPanel, 'update');

      // when
      eventBus.fire('root.added', {
        element: {
          id: '__implicitroot',
          isImplicit: true
        }
      });

      // expect
      expect(spy).to.not.have.been.called;
    }));


    it('should update on selection changed', inject(
      function(elementRegistry, eventBus, propertiesPanel, selection) {

        // given
        var spy = sinon.spy(propertiesPanel, 'update');

        var startEvent = elementRegistry.get('StartEvent_1');

        // when
        selection.select(startEvent);

        // then
        expect(spy).to.have.been.called;
      }
    ));


    it('should not update on selection changed if implicit root', inject(
      function(canvas, eventBus, propertiesPanel, selection) {

        // given
        var spy = sinon.spy(propertiesPanel, 'update');

        canvas.setRootElement({
          id: '__implicitroot',
          isImplicit: true
        }, true);

        // when
        selection.select(null);

        // then
        expect(spy).to.not.have.been.called;
      }
    ));


    it('should update on action triggered', inject(
      function(elementRegistry, selection, propertiesPanel) {

        // given
        propertiesPanel.attachTo(container);
        var task = elementRegistry.get('Task_1');
        selection.select(task);
        var spy = sinon.spy(propertiesPanel, 'update');

        var button = domQuery('[data-entry="external-edit"] [data-action]');

        // when
        TestHelper.triggerEvent(button, 'click');

        // then
        expect(spy).to.have.been.called;
      }));
  });


  describe('helpers', function() {

    describe('inject element id into [data-label-id] element', function() {

      function headerText(propertiesPanel) {
        return domQuery('[data-label-id]', propertiesPanel._container).textContent;
      }

      var eventShape;

      beforeEach(inject(function(propertiesPanel, elementRegistry) {
        propertiesPanel.attachTo(container);

        eventShape = elementRegistry.get('StartEvent_1');
      }));


      it('should display initially', inject(function(propertiesPanel, selection) {

        // when
        selection.select(eventShape);

        // then
        expect(headerText(propertiesPanel)).to.eql(eventShape.id);
      }));


      it('should display element id when selecting label', inject(function(propertiesPanel, selection) {

        // when
        selection.select(eventShape.label);

        // then
        expect(headerText(propertiesPanel)).to.eql(eventShape.id);
      }));


      it('should update on id edit',
        inject(function(propertiesPanel, selection, modeling) {

          // given
          var newId = 'BAR';

          selection.select(eventShape);

          // when
          modeling.updateProperties(eventShape, { id: newId });

          // then
          expect(headerText(propertiesPanel)).to.eql(newId);
        })
      );


      it('should update on id undo', inject(function(propertiesPanel, selection, commandStack, modeling) {

        // given
        var oldId = eventShape.id;

        selection.select(eventShape);
        modeling.updateProperties(eventShape, { id: 'BAR' });

        // when
        commandStack.undo();

        // then
        expect(headerText(propertiesPanel)).to.eql(oldId);
      }));

    });

  });


  describe('tab selection', function() {

    function getActiveTabId(container) {
      var activeTabNode = domQuery('.bpp-properties-tab.bpp-active', container);
      return domAttr(activeTabNode, 'data-tab');
    }

    it('should keep the selected tab when changing the selected element',
      inject(function(propertiesPanel, selection, elementRegistry) {

        propertiesPanel.attachTo(container);

        // select event
        var shape = elementRegistry.get('StartEvent_1');
        selection.select(shape);

        // check selected tab
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab2');

        // select task
        shape = elementRegistry.get('Task_1');
        selection.select(shape);

        // check selected tab again
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab2');

      }));


    it('should select the first visible tab because the selected tab does not exist',
      inject(function(propertiesPanel, selection, elementRegistry) {

        propertiesPanel.attachTo(container);

        // select task
        var shape = elementRegistry.get('Task_1');
        selection.select(shape);

        // select tab3
        propertiesPanel.activateTab('tab3');

        // check selected tab
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab3');

        // select event
        shape = elementRegistry.get('StartEvent_1');
        selection.select(shape);

        // check selected tab again
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab2');

      }));

  });


  describe('description for field entry', function() {

    function getDescriptionField(container, dataEntrySelector) {
      return domQuery(dataEntrySelector + ' .bpp-field-description', container);
    }

    var eventShape;

    beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
      propertiesPanel.attachTo(container);

      eventShape = elementRegistry.get('StartEvent_1');
      selection.select(eventShape);

    }));


    it('only text', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=myText]');

      expect(descriptionField.textContent).to.be.equal('This field is for documentation');
    }));


    it('with a markdown link', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=myLinkText]');

      expect(descriptionField.textContent).to.be.equal('For details see camunda.org');

      var link = domQuery('a', descriptionField);

      expect(link.href).to.be.equal('http://www.camunda.org/');
      expect(link.textContent).to.be.equal('camunda.org');
    }));


    it('with an html link', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=myHtmlLinkText]');

      expect(descriptionField.textContent).to.be.equal('For details see camunda.org');

      var link = domQuery('a', descriptionField);

      expect(link.href).to.be.equal('http://www.camunda.org/');
      expect(link.textContent).to.be.equal('camunda.org');
    }));


    it('with a malicious link', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=maliciousLinkText]');

      expect(descriptionField.textContent).to.be.equal('For malicious code see [javascript](javascript:alert(1))');

      var link = domQuery('a', descriptionField);

      expect(link).to.not.exist;
    }));

  });


  describe('table entry input field selection', function() {

    function getTableEntryInputField(container) {
      return domQuery('input[name=value]', container);
    }

    var input;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      propertiesPanel.attachTo(container);

      var eventShape = elementRegistry.get('StartEvent_1');
      selection.select(eventShape);

      input = getTableEntryInputField(propertiesPanel._container);

    }));


    describe('add text to the end, cursor position is at the end', function() {

      beforeEach(function() {

        expect(input.selectionStart).to.equal(input.value.length);
        expect(input.selectionEnd).to.equal(input.value.length);

        TestHelper.triggerValue(input, 'BARabc', 6);
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('BARabc');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(input.value).to.equal('BAR');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(input.value).to.equal('BARabc');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);

        }));

      });

    });


    describe('add text in the middle, cursor position is after the added text', function() {

      beforeEach(function() {

        expect(input.selectionStart).to.equal(input.value.length);
        expect(input.selectionEnd).to.equal(input.value.length);

        TestHelper.triggerValue(input, 'BAabcR', 5);
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('BAabcR');

          // cursor position after 'BAabc'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(input.value).to.equal('BAR');

          // cursor position after 'BA'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(input.value).to.equal('BAabcR');

          // cursor position after 'BAabc'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);

        }));

      });

    });

  });


  describe('listeners', function() {

    function getSelect(container) {
      return domQuery('select[name=select]', container);
    }

    var select, spy;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      propertiesPanel.attachTo(container);

      var task2 = elementRegistry.get('Task_2');
      selection.select(task2);

      select = getSelect(propertiesPanel._container);

      spy = sinon.spy();

      document.addEventListener('keydown', spy);
    }));

    afterEach(function() {
      document.removeEventListener('keydown', spy);
    });


    it('should stop propagation of DEL key events', function() {

      // when
      TestHelper.triggerKeyEvent(select, 'keydown', 46);

      // then
      expect(spy).to.not.have.been.called;
    });


    // Cannot be tested due to paste events not affecting document's contents per default.
    // Cf. https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    it('should paste to [contenteditable] as plain text');
  });


  describe('integration test', function() {

    describe('validation', function() {

      function alwaysValidateFunc() {
        return 'Validation Message';
      }

      it('should render for autoSuggestTextBox', inject(function(propertiesPanel) {

        // given
        var autoSuggestTextBox = entryFactory.autoSuggest(translate, {
          label: 'autoSuggestTextBox Label',
          validate: alwaysValidateFunc,
          modelProperty: 'dummy'
        }).html;

        var containerNode = domify('<div></div>');
        containerNode.appendChild(autoSuggestTextBox);

        // when
        propertiesPanel.applyValidationErrors({ dummy: 'Validation Error' }, containerNode);

        // then
        expect(containerNode.innerHTML).to.eql('<label for="camunda-undefined">' +
        'autoSuggestTextBox Label</label><div class="bpp-field-wrapper">' +
        '<div contenteditable="true" id="camunda-undefined" name="dummy" ' +
        'data-auto-suggest="suggestItems" data-blur="handleFocusLeave" class="invalid">' +
        '</div><div class="bpp-error-message">Validation Error</div>' +
        '<div class="bpp-autosuggest-list"></div></div>');
      }));


      it('should render for textBox', inject(function(propertiesPanel) {

        // given
        var textBox = entryFactory.textBox(translate, {
          label: 'textBox Label',
          validate: alwaysValidateFunc,
          modelProperty: 'dummy'
        }).html;

        var containerNode = domify('<div></div>');
        containerNode.appendChild(textBox);

        // when
        propertiesPanel.applyValidationErrors({ dummy: 'Validation Error' }, containerNode);

        // then
        expect(containerNode.innerHTML).to.eql('<label for="camunda-undefined">' +
        'textBox Label</label><div class="bpp-field-wrapper">' +
        '<div contenteditable="true" id="camunda-undefined" name="dummy" ' +
        'class="invalid"></div><div class="bpp-error-message">Validation Error</div></div>');
      }));


      it('should render for textField', inject(function(propertiesPanel) {

        // given
        var textField = entryFactory.textBox(translate, {
          label: 'textField Label',
          validate: alwaysValidateFunc,
          modelProperty: 'dummy'
        }).html;

        var containerNode = domify('<div></div>');
        containerNode.appendChild(textField);

        // when
        propertiesPanel.applyValidationErrors({ dummy: 'Validation Error' }, containerNode);

        // then
        expect(containerNode.innerHTML).to.eql('<label for="camunda-undefined">' +
        'textField Label</label><div class="bpp-field-wrapper">' +
        '<div contenteditable="true" id="camunda-undefined" name="dummy" ' +
        'class="invalid"></div><div class="bpp-error-message">Validation Error' +
        '</div></div>');
      }));


      it('should render for validationAwareTextField', inject(function(propertiesPanel) {

        // given
        var validationAwareTextField = entryFactory.validationAwareTextField(translate, {
          label: 'validationAwareTextField Label',
          validate: alwaysValidateFunc,
          modelProperty: 'dummy'
        }).html;

        var containerNode = domify('<div></div>');
        containerNode.appendChild(validationAwareTextField);

        // when
        propertiesPanel.applyValidationErrors({ dummy: 'Validation Error' }, containerNode);

        // then
        expect(containerNode.innerHTML).to.eql('<label for="camunda-undefined">' +
        'validationAwareTextField Label</label><div class="bpp-field-wrapper">' +
        '<input id="camunda-undefined" type="text" name="dummy" class="invalid">' +
        '<div class="bpp-error-message">Validation Error</div><button ' +
        'class="action-button clear" data-action="clear" data-show="canClear">' +
        '<span>X</span></button></div>');
      }));


      it('should render for checkbox', inject(function(propertiesPanel) {

        // given
        var checkboxEntry = entryFactory.checkbox(translate, {
          id: 'checkboxId',
          label: 'checkboxLabel',
          validate: alwaysValidateFunc,
          modelProperty: 'dummy'
        }).html;

        var containerNode = domify('<div></div>');
        containerNode.appendChild(checkboxEntry);

        // when
        propertiesPanel.applyValidationErrors({ dummy: 'Validation Error' }, containerNode);

        // then
        expect(containerNode.innerHTML).to.eql('<input id="camunda-checkboxId" ' +
        'type="checkbox" name="dummy" class="invalid"><div class="bpp-error-message">' +
        'Validation Error</div><label for="camunda-checkboxId">checkboxLabel</label>');
      }));


    });


    describe('input handling', function() {

      it('should emit keyboard events for undo/redo when editing', inject(
        function(eventBus, propertiesPanel, keyboard) {

          // given
          var spy = sinon.spy();

          var inputField = propertiesPanel._container.querySelector('input');

          eventBus.on('keyboard.keydown', spy);

          // when
          // select all
          keyboard._keyHandler({ key: 'a', ctrlKey: true, target: inputField });

          // then
          // use browser default
          expect(spy).to.not.be.called;

          // when
          // undo/redo
          keyboard._keyHandler({ key: 'z', metaKey: true, target: inputField });
          keyboard._keyHandler({ key: 'y', ctrlKey: true, target: inputField });

          // then
          // fire events
          expect(spy).to.have.been.calledTwice;
        }));

    });

  });


  describe('properties providers', function() {

    it('should register provider', inject(
      function(propertiesPanel) {

        // given

        // when
        // high priority provider
        propertiesPanel.registerProvider(1500, {
          getTabs: function(element) {
            expect(element).to.exist;

            return function(tabs) {
              expect(tabs).to.be.empty;
            };
          }
        });

        // default priority provider
        propertiesPanel.registerProvider({
          getTabs: function(element) {
            expect(element).to.exist;

            return function(tabs) {
              expect(tabs).to.have.length(3);

              // clear tabs
              return [];
            };
          }
        });

        propertiesPanel.attachTo(container);

        // then
        expect(document.querySelectorAll('.bpp-properties-tab', container)).to.be.empty;
      }
    ));


    it('should ignore incompatible provider', inject(function(propertiesPanel) {

      // assume
      expect(propertiesPanel._getProviders()).to.have.length(1);

      // given
      var incompatibleProvider = {
        getGroups: function() {
          return [];
        }
      };

      // when
      propertiesPanel.registerProvider(incompatibleProvider);

      // then
      // incompatible provider was not added
      expect(propertiesPanel._getProviders()).to.have.length(1);
    }));

  });

});

// helper //////////////////////////

function translate(string) {
  return string;
}
