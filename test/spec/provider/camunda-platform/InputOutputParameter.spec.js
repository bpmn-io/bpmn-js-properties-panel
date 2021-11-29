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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getInputOutputType,
  getInputParameters
} from 'src/provider/camunda-platform/utils/InputOutputUtil';

import diagramXML from './InputOutputParameter.bpmn';


describe('provider/camunda-platform - InputOutputParameter', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
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


  describe('bpmn:ServiceTask', function() {

    describe('#inputParameter.name', function() {

      it('should NOT display for empty parameters', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_empty-inputParameter-1-name]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_1-inputParameter-0-name]', group);

        // then
        expect(input.value).to.eql(getInputParameter(serviceTask, 0).get('name'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_1-inputParameter-0-name]', group);
        changeInput(input, 'newValue');

        // then
        expect(getInputParameter(serviceTask, 0).get('name')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const originalValue = getInputParameter(serviceTask, 0).get('name');

          await act(() => {
            selection.select(serviceTask);
          });
          const group = getGroup(container, 'CamundaPlatform__Input');
          const input = domQuery('input[name=ServiceTask_1-inputParameter-0-name]', group);
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


    describe('#inputParameter.type', function() {

      it('should NOT display for empty parameters',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_empty');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const group = getGroup(container, 'CamundaPlatform__Input');
          const select = domQuery('select[name=ServiceTask_empty-inputParameter-0-type]', group);

          // then
          expect(select).to.not.exist;
        })
      );


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const select = domQuery('select[name=ServiceTask_1-inputParameter-0-type]', group);

        // then
        expect(select.value).to.eql(getInputOutputType(getInputParameter(serviceTask, 0)));
      }));


      it('should update - stringOrExpression', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const select = domQuery('select[name=ServiceTask_1-inputParameter-1-type]', group);
        changeInput(select, 'stringOrExpression');

        // then
        const parameter = getInputParameter(serviceTask, 1);
        expect(parameter.get('definition')).to.not.exist;
      }));


      it('should update - script', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const select = domQuery('select[name=ServiceTask_1-inputParameter-0-type]', group);
        changeInput(select, 'script');

        // then
        const parameter = getInputParameter(serviceTask, 0);
        expect(parameter.get('definition')).to.exist;
        expect(parameter.get('definition').$type).to.eql('camunda:Script');
        expect(parameter.get('value')).to.not.exist;
      }));


      it('should update - list', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const select = domQuery('select[name=ServiceTask_1-inputParameter-0-type]', group);
        changeInput(select, 'list');

        // then
        const parameter = getInputParameter(serviceTask, 0);
        expect(parameter.get('definition')).to.exist;
        expect(parameter.get('definition').$type).to.eql('camunda:List');
        expect(parameter.get('value')).to.not.exist;
      }));


      it('should update - map', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const select = domQuery('select[name=ServiceTask_1-inputParameter-0-type]', group);
        changeInput(select, 'map');

        // then
        const parameter = getInputParameter(serviceTask, 0);
        expect(parameter.get('definition')).to.exist;
        expect(parameter.get('definition').$type).to.eql('camunda:Map');
        expect(parameter.get('value')).to.not.exist;
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const originalValue = getInputOutputType(getInputParameter(serviceTask, 0));

          await act(() => {
            selection.select(serviceTask);
          });
          const group = getGroup(container, 'CamundaPlatform__Input');
          const select = domQuery('select[name=ServiceTask_1-inputParameter-0-type]', group);
          changeInput(select, 'script');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(select.value).to.eql(originalValue);
        })
      );

    });


    describe('#inputParameter.value', function() {

      it('should NOT display for empty parameters', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const textarea = domQuery('textarea[name=ServiceTask_empty-inputParameter-1-stringOrExpression]', group);

        // then
        expect(textarea).to.not.exist;
      }));


      it('should NOT display for script parameters', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const textarea = domQuery('textarea[name=ServiceTask_1-inputParameter-1-stringOrExpression]', group);

        // then
        expect(textarea).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const textarea = domQuery('textarea[name=ServiceTask_1-inputParameter-0-stringOrExpression]', group);

        // then
        expect(textarea.value).to.eql(getInputParameter(serviceTask, 0).get('value'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const textarea = domQuery('textarea[name=ServiceTask_1-inputParameter-0-stringOrExpression]', group);
        changeInput(textarea, 'newValue');

        // then
        expect(getInputParameter(serviceTask, 0).get('value')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const originalValue = getInputParameter(serviceTask, 0).get('value');

          await act(() => {
            selection.select(serviceTask);
          });
          const group = getGroup(container, 'CamundaPlatform__Input');
          const textarea = domQuery('textarea[name=ServiceTask_1-inputParameter-0-stringOrExpression]', group);
          changeInput(textarea, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(textarea.value).to.eql(originalValue);
        })
      );

    });


    describe('#inputParameter.scriptFormat', function() {

      it('should NOT display for empty parameters', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_empty-inputParameter-0-scriptFormat]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should NOT display for list parameters', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_1-inputParameter-2-scriptFormat]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_1-inputParameter-1-scriptFormat]', group);

        const script = getDefinition(getInputParameter(serviceTask, 1));

        // then
        expect(input.value).to.eql(script.get('scriptFormat'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name=ServiceTask_1-inputParameter-1-scriptFormat]', group);
        changeInput(input, 'newValue');

        const script = getDefinition(getInputParameter(serviceTask, 1));

        // then
        expect(script.get('scriptFormat')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const script = getDefinition(getInputParameter(serviceTask, 1));
          const originalValue = script.get('scriptFormat');

          await act(() => {
            selection.select(serviceTask);
          });
          const group = getGroup(container, 'CamundaPlatform__Input');
          const input = domQuery('input[name=ServiceTask_1-inputParameter-1-scriptFormat]', group);
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

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInputParameter(element, idx) {
  return (getInputParameters(element) || [])[idx];
}

function getDefinition(parameter) {
  return parameter.get('definition');
}