import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ScriptProps.bpmn';


describe('provider/camunda-platform - ScriptTaskProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('bpmn:ScriptTask#resultVariable', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=scriptResultVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResultVariable]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(scriptTask).get('camunda:resultVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResultVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(scriptTask).get('camunda:resultVariable')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        const originalValue = getBusinessObject(scriptTask).get('camunda:resultVariable');

        await act(() => {
          selection.select(scriptTask);
        });
        const input = domQuery('input[name=scriptResultVariable]', container);
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

});