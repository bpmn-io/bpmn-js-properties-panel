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

import diagramXML from './FormKeyProps.bpmn';


describe('provider/camunda-platform - UserAssignmentProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
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

  describe('#camunda:formKey', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(event);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      // then
      expect(input).to.exist;
      expect(input.value).to.equal(getFormKey(event));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const input = domQuery('input[name=formKey]', container);
      changeInput(input, 'newValue');

      // then
      expect(getFormKey(event)).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const event = elementRegistry.get('StartEvent_1');
        const originalValue = getFormKey(event);

        await act(() => {
          selection.select(event);
        });

        const input = domQuery('input[name=formKey]', container);
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

// helper //////

function getFormKey(element) {
  const bo = getBusinessObject(element);
  return bo.get('camunda:formKey');
}
