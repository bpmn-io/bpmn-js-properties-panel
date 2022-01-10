import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ListenerProps.bpmn';
import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';
import { getTimerEventDefinition } from '../../../../src/provider/bpmn/utils/EventDefinitionUtil';


describe('provider/camunda-platform - ListenerProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    CamundaPlatformPropertiesProvider
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('camunda:ExecutionListener', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
      const listItems = getListenerListItems(group, 'executionListener');

      const listeners = getListeners(participant);

      // then
      expect(group).to.exist;
      expect(listItems).to.have.length(listeners.length);
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Collaboration_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');

      // then
      expect(group).not.to.exist;
    }));


    it('should display proper label', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', group);

      // then
      expect(label).to.have.property('textContent', 'Start: Java class');
    }));


    it('should add new listener', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getListeners(participant)).to.have.length(2);
    }));


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const empty = elementRegistry.get('Empty');

        await act(() => {
          selection.select(empty);
        });

        // assume
        expect(getBusinessObject(empty).get('extensionElements')).not.to.exist;

        const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(empty).get('extensionElements')).to.exist;
        expect(getListeners(empty)).to.have.length(1);
      })
    );


    it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

      // given
      const otherExtensions = elementRegistry.get('OtherExtensions');

      await act(() => {
        selection.select(otherExtensions);
      });

      // assume
      expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;

      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;
      expect(getListeners(otherExtensions)).to.have.length(1);
    }));


    it('should delete listener', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
      const listItems = getListenerListItems(group, 'executionListener');
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getListeners(participant)).to.have.length(0);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');
        const originalListeners = getListeners(participant);

        await act(() => {
          selection.select(participant);
        });

        const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const listItems = getListenerListItems(group, 'executionListener');

        // then
        expect(listItems).to.have.length(originalListeners.length);
      })
    );

    describe('camunda:ExecutionListener#class', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Expression');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=javaClass]', container);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('JavaClass');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=javaClass]', container);

        // then
        expect(input.value).to.eql(
          getFirstListener(element).get('camunda:class')
        );
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('JavaClass');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=javaClass]', container);
        changeInput(input, 'newValue');

        // then
        expect(getFirstListener(element).get('camunda:class')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const element = elementRegistry.get('JavaClass');

          const originalValue = getFirstListener(element).get('camunda:class');

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('input[name*=javaClass]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        })
      );

    });


    describe('camunda:ExecutionListener#expression', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('JavaClass');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=expression]', container);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Expression');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=expression]', container);

        // then
        expect(input.value).to.eql(
          getFirstListener(element).get('camunda:expression')
        );
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Expression');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=expression]', container);
        changeInput(input, 'newValue');

        // then
        expect(getFirstListener(element).get('camunda:expression')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const element = elementRegistry.get('Expression');

          const originalValue = getFirstListener(element).get('camunda:expression');

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('input[name*=expression]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        })
      );

    });


    describe('camunda:ExecutionListener#delegateExpression', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('JavaClass');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=delegateExpression]', container);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('DelegateExpression');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=delegateExpression]', container);

        // then
        expect(input.value).to.eql(
          getFirstListener(element).get('camunda:delegateExpression')
        );
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('DelegateExpression');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=delegateExpression]', container);
        changeInput(input, 'newValue');

        // then
        expect(getFirstListener(element).get('camunda:delegateExpression')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const element = elementRegistry.get('DelegateExpression');

          const originalValue = getFirstListener(element).get('camunda:delegateExpression');

          await act(() => {
            selection.select(element);
          });
          const input = domQuery('input[name*=delegateExpression]', container);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        })
      );

    });


    describe('field injection', function() {

      it('should add field', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('FieldInjected');
        const listener = getFirstListener(element);
        const originalFields = getFields(listener).slice();

        await act(() => {
          selection.select(element);
        });
        const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
        const fields = domQuery('[data-entry-id*=fields]', group);

        // when
        const addField = domQuery('.bio-properties-panel-add-entry', fields);
        await act(() => {
          addField.click();
        });

        // then
        const newFields = getFields(listener);
        expect(newFields).to.have.length(originalFields.length + 1);
      }));


      it('should remove field', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('FieldInjected');
        const listener = getFirstListener(element);
        const originalFields = getFields(listener).slice();

        await act(() => {
          selection.select(element);
        });
        const group = getGroup(container, 'CamundaPlatform__ExecutionListener');
        const fields = domQuery('[data-entry-id*=fields]', group);

        // when
        const removeField = domQuery('.bio-properties-panel-remove-entry', fields);
        await act(() => {
          removeField.click();
        });

        // then
        const newFields = getFields(listener);
        expect(newFields).to.have.length(originalFields.length - 1);
      }));
    });

  });


  describe('camunda:TaskListener', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('TaskListener');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__TaskListener');
      const listItems = getListenerListItems(group, 'taskListener');
      const listeners = getListeners(participant);

      // then
      expect(group).to.exist;
      expect(listItems).to.have.length(listeners.length);
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__TaskListener');

      // then
      expect(group).not.to.exist;
    }));


    it('should display proper label', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('TaskListener');

      await act(() => {
        selection.select(participant);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__TaskListener');
      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', group);

      // then
      expect(label).to.have.property('textContent', 'Timeout: Java class');
    }));


    it('should add new listener', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('TaskListener');

      await act(() => {
        selection.select(participant);
      });

      const group = getGroup(container, 'CamundaPlatform__TaskListener');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getListeners(participant)).to.have.length(2);
    }));


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const empty = elementRegistry.get('EmptyUserTask');

        await act(() => {
          selection.select(empty);
        });

        // assume
        expect(getBusinessObject(empty).get('extensionElements')).not.to.exist;

        const group = getGroup(container, 'CamundaPlatform__TaskListener');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(empty).get('extensionElements')).to.exist;
        expect(getListeners(empty)).to.have.length(1);
      })
    );


    it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

      // given
      const otherExtensions = elementRegistry.get('OtherExtensions');

      await act(() => {
        selection.select(otherExtensions);
      });

      // assume
      expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;

      const group = getGroup(container, 'CamundaPlatform__TaskListener');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;
      expect(getListeners(otherExtensions)).to.have.length(1);
    }));


    it('should delete listener', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('TaskListener');

      await act(() => {
        selection.select(participant);
      });

      const group = getGroup(container, 'CamundaPlatform__TaskListener');
      const listItems = getListenerListItems(group, 'taskListener');
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getListeners(participant)).to.have.length(0);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('TaskListener');
        const originalListeners = getListeners(participant);

        await act(() => {
          selection.select(participant);
        });

        const group = getGroup(container, 'CamundaPlatform__TaskListener');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const listItems = getListenerListItems(group, 'taskListener');

        // then
        expect(listItems).to.have.length(originalListeners.length);
      })
    );


    describe('listenerId', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TaskListener');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=listenerId]', container);

        // then
        expect(input.value).to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TaskListener');

        await act(() => {
          selection.select(element);
        });

        // when
        const input = domQuery('input[name*=listenerId]', container);
        changeInput(input, 'newValue');

        // then
        expect(getFirstListener(element).get('camunda:id')).to.eql('newValue');

      }));

    });


    describe('listenerType', function() {

      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('ExpressionTaskListener');

        await act(() => {
          selection.select(element);
        });

        // assume
        expect(getFirstListener(element).get('event')).eql('create');

        // when
        const eventTypeSelect = domQuery('select[name*=eventType]', container);
        changeInput(eventTypeSelect, 'update');

        // then
        expect(getFirstListener(element).get('event')).eql('update');
      }));


      it('should clear eventDefinitions', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('ExpressionTaskListener');

        await act(() => {
          selection.select(element);
        });

        // when
        const eventTypeSelect = domQuery('select[name*=eventType]', container);
        changeInput(eventTypeSelect, 'timeout');

        // then
        expect(getFirstListener(element).get('eventDefinitions')).to.have.length(1);

        // when
        changeInput(eventTypeSelect, 'assignment');

        // then
        expect(getFirstListener(element).get('eventDefinitions')).to.have.length(0);
      }));


    });


    describe('camunda:TaskListener#eventTimerDefinition', function() {

      it('should create eventDefinitions when eventType = timeout', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TaskListener');

        await act(() => {
          selection.select(element);
        });

        // assume
        expect(getFirstListener(element).get('event')).eql('timeout');

        // when
        const timerDefinition = getTimerEventDefinition(getFirstListener(element));

        // then
        expect(timerDefinition).to.exist;
      }));


      it('should update eventDefinitions when eventType is updated to timeout', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('ExpressionTaskListener');

        await act(() => {
          selection.select(element);
        });

        // assume
        let timerDefinition = getTimerEventDefinition(getFirstListener(element));
        expect(timerDefinition).to.not.exist;

        // when
        const eventTypeSelect = domQuery('select[name*=eventType]', container);
        changeInput(eventTypeSelect, 'timeout');

        const timerDefinitionSelect = domQuery('select[name*=timerEventDefinitionType]', container);
        changeInput(timerDefinitionSelect, 'Duration');

        timerDefinition = getTimerEventDefinition(getFirstListener(element));

        // then
        expect(timerDefinition).to.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('TaskListener');

        await act(() => {
          selection.select(element);
        });

        // when
        const select = domQuery('select[name*=timerEventDefinitionType]', container);

        // then
        expect(select).to.exist;
      }));


      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('ExpressionTaskListener');

        await act(() => {
          selection.select(element);
        });

        // when
        const select = domQuery('select[name*=timerEventDefinitionType]', container);

        // then
        expect(select).to.not.exist;
      }));

    });


  });


});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getListenerListItems(container, listenerGroup) {
  return getListItems(container, listenerGroup);
}

function getListeners(element) {
  const bo = getBusinessObject(element);
  const executionListeners = getExtensionElementsList(bo.get('processRef') || bo, 'camunda:ExecutionListener');
  const taskListeners = getExtensionElementsList(bo.get('processRef') || bo, 'camunda:TaskListener');

  return executionListeners.concat(taskListeners);
}

function getFields(listener) {
  return listener.get('fields');
}

function getFirstListener(element) {
  return getListeners(element)[0];
}
