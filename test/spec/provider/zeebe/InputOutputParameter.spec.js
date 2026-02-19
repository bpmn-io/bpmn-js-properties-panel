import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  findField,
  queryField,
  fieldValue,
  setFieldValue,
  findGroup,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getInputParameters,
  getOutputParameters
} from 'src/provider/zeebe/utils/InputOutputUtil';

import diagramXML from './InputOutputParameter.bpmn';


describe('provider/zeebe - InputOutputParameter', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
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


  describe('bpmn:ServiceTask#input.target', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const inputGroup = findGroup(container, 'inputs');
        const targetInput = queryField('ServiceTask_empty-input-0-target', inputGroup);

        // then
        expect(targetInput).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = findGroup(container, 'inputs');
      const targetInput = findField('ServiceTask_1-input-0-target', inputGroup);

      // then
      expect(fieldValue(targetInput)).to.eql(getInput(serviceTask, 0).get('target'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = findGroup(container, 'inputs');
      const targetInput = findField('ServiceTask_1-input-0-target', inputGroup);
      await setFieldValue(targetInput, 'newValue');

      // then
      expect(getInput(serviceTask, 0).get('target')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getInput(serviceTask, 0).get('target');

        await act(() => {
          selection.select(serviceTask);
        });
        const inputGroup = findGroup(container, 'inputs');
        const targetInput = findField('ServiceTask_1-input-0-target', inputGroup);
        await setFieldValue(targetInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(fieldValue(targetInput)).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#input.source', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const inputGroup = findGroup(container, 'inputs');
        const sourceInput = queryField('ServiceTask_empty-input-0-source', inputGroup);

        // then
        expect(sourceInput).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = findGroup(container, 'inputs');
      const sourceInput = findField('ServiceTask_1-input-0-source', inputGroup);

      // then
      expect('=' + fieldValue(sourceInput)).to.eql(getInput(serviceTask, 0).get('source'));
    }));


    it('should allow toggle (static vs. dynamic)', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = findGroup(container, 'inputs');

      const feelToggle = domQuery(
        '[data-entry-id="ServiceTask_1-input-0"] button.bio-properties-panel-feel-icon.optional',
        inputGroup
      );

      // then
      expect(feelToggle).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = findGroup(container, 'inputs');
      const sourceInput = findField('ServiceTask_1-input-0-source', inputGroup);
      await setFieldValue(sourceInput, 'newValue');

      // then
      expect(getInput(serviceTask, 0).get('source')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getInput(serviceTask, 0).get('source');

        await act(() => {
          selection.select(serviceTask);
        });
        const inputGroup = findGroup(container, 'inputs');
        const sourceInput = findField('ServiceTask_1-input-0-source', inputGroup);
        await setFieldValue(sourceInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + sourceInput.textContent).to.eql(originalValue);
      })
    );


    describe('integration', function() {

      // Test for undo/redo integration with newly created input/output parameters
      // cf. https://github.com/bpmn-io/bpmn-js-properties-panel/issues/981
      it('should undo',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_empty');

          await act(() => {
            selection.select(serviceTask);
          });

          const inputGroup = findGroup(container, 'inputs');
          const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

          await act(() => {
            addEntry.click();
          });

          const field = findField('ServiceTask_empty-input-0-source', inputGroup);
          await setFieldValue(field, 'newValue');

          // assume
          expect(getInput(serviceTask, 0).get('source')).to.eql('newValue');

          // when
          commandStack.undo();
          await nextTick(); // propagate value to editor and await change handler

          // then
          expect(getInput(serviceTask, 0).get('source')).to.be.undefined;
        })
      );


      it('should redo',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_empty');

          await act(() => {
            selection.select(serviceTask);
          });

          const inputGroup = findGroup(container, 'inputs');
          const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

          await act(() => {
            addEntry.click();
          });

          const sourceInput = findField('ServiceTask_empty-input-0-source', inputGroup);
          await setFieldValue(sourceInput, 'newValue');

          // assume
          expect(getInput(serviceTask, 0).get('source')).to.eql('newValue');

          // when
          commandStack.undo();
          await nextTick();
          commandStack.redo();
          await nextTick();

          // then
          expect(getInput(serviceTask, 0).get('source')).to.eql('newValue');

        })
      );
    });

  });


  describe('bpmn:ServiceTask#output.target', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const outputGroup = findGroup(container, 'outputs');
        const targetInput = queryField('ServiceTask_empty-output-0-target', outputGroup);

        // then
        expect(targetInput).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = findGroup(container, 'outputs');
      const targetInput = findField('ServiceTask_1-output-0-target', outputGroup);

      // then
      expect(fieldValue(targetInput)).to.eql(getOutput(serviceTask, 0).get('target'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const targetInput = findField('ServiceTask_1-output-0-target', container);
      await setFieldValue(targetInput, 'newValue');

      // then
      expect(getOutput(serviceTask, 0).get('target')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getOutput(serviceTask, 0).get('target');

        await act(() => {
          selection.select(serviceTask);
        });
        const targetInput = findField('ServiceTask_1-output-0-target', container);
        await setFieldValue(targetInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(fieldValue(targetInput)).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#output.source', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const outputGroup = findGroup(container, 'outputs');
        const sourceInput = queryField('ServiceTask_empty-output-0-source', outputGroup);

        // then
        expect(sourceInput).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = findGroup(container, 'outputs');
      const sourceInput = findField('ServiceTask_1-output-0-source', outputGroup);

      // then
      expect('=' + fieldValue(sourceInput)).to.eql(getOutput(serviceTask, 0).get('source'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = findGroup(container, 'outputs');
      const sourceInput = findField('ServiceTask_1-output-0-source', outputGroup);
      await setFieldValue(sourceInput, 'newValue');

      // then
      expect(getOutput(serviceTask, 0).get('source')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getOutput(serviceTask, 0).get('source');

        await act(() => {
          selection.select(serviceTask);
        });
        const outputGroup = findGroup(container, 'outputs');
        const sourceInput = findField('ServiceTask_1-output-0-source', outputGroup);
        await setFieldValue(sourceInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + sourceInput.textContent).to.eql(originalValue);
      })
    );


    describe('integration', function() {

      // Test for undo/redo integration with newly created input/output parameters
      // Cf. https://github.com/bpmn-io/bpmn-js-properties-panel/issues/981
      it('should undo',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_empty');

          await act(() => {
            selection.select(serviceTask);
          });

          const outputGroup = findGroup(container, 'outputs');
          const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

          await act(() => {
            addEntry.click();
          });

          const sourceInput = findField('ServiceTask_empty-output-0-source', outputGroup);
          await setFieldValue(sourceInput, 'newValue');

          // assume
          expect(getOutput(serviceTask, 0).get('source')).to.eql('=newValue');

          // when
          commandStack.undo();
          await nextTick(); // propagate value to editor and await change handler

          // then
          expect(getOutput(serviceTask, 0).get('source')).to.be.undefined;
        })
      );


      it('should redo',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_empty');

          await act(() => {
            selection.select(serviceTask);
          });

          const outputGroup = findGroup(container, 'outputs');
          const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

          await act(() => {
            addEntry.click();
          });

          const sourceInput = findField('ServiceTask_empty-output-0-source', outputGroup);
          await setFieldValue(sourceInput, 'newValue');

          // assume
          expect(getOutput(serviceTask, 0).get('source')).to.eql('=newValue');

          // when
          commandStack.undo();
          await nextTick();
          commandStack.redo();
          await nextTick();

          // then
          expect(getOutput(serviceTask, 0).get('source')).to.eql('=newValue');

        })
      );
    });

  });

});


// helper //////////////////

function getInput(element, idx) {
  return (getInputParameters(element) || [])[idx];
}

function getOutput(element, idx) {
  return (getOutputParameters(element) || [])[idx];
}

function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}