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
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { getPriorityDefinition } from 'src/provider/zeebe/properties/PriorityDefinitionProps';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './PriorityDefinitionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';
import { getExtensionElementsList } from '../../../../src/utils/ExtensionElementsUtil';


describe('provider/zeebe - PriorityDefinitionProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider,
    BehaviorsModule
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


  describe('zeebe:priorityDefinition', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const priorityInput = domQuery('input[name=priorityDefinitionPriority]', container);

      // then
      expect(priorityInput).to.not.exist;
    }));


    it('should NOT display for user task without zeebe:UserTask', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_0');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const priorityInput = domQuery('input[name=priorityDefinitionPriority]', container);

      // then
      expect(priorityInput).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="priorityDefinitionPriority"]', container);

      // then
      expect(entry).to.exist;

      // is FEEL input
      const input = domQuery('[role="textbox"]', entry);
      expect(input).to.exist;

      const priorityDefinition = getPriorityDefinition(userTask);
      const feelExpression = priorityDefinition.get('priority').substring(1);

      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const priorityInput = domQuery('[data-entry-id="priorityDefinitionPriority"] [role="textbox"]', container);

      await setEditorValue(priorityInput, 'newValue');

      // then
      // keep FEEL configuration
      expect(getPriorityDefinition(userTask).get('priority')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getPriorityDefinition(userTask).get('priority');

        await act(() => {
          selection.select(userTask);
        });
        const priorityInput = domQuery('[data-entry-id="priorityDefinitionPriority"] [role="textbox"]', container);
        await setEditorValue(priorityInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + priorityInput.textContent).to.eql(originalValue);
      })
    );


    it('should create priority definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getExtensionElementsList(getBusinessObject(userTask), 'zeebe:priorityDefinition')).to.be.empty;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const priorityInput = domQuery('input[name=priorityDefinitionPriority]', container);
        changeInput(priorityInput, 'newValue');

        // then
        const priorityDefinitionElement = getExtensionElementsList(getBusinessObject(userTask), 'zeebe:PriorityDefinition')[0];
        expect(priorityDefinitionElement).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new priority definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getPriorityDefinition(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const priorityInput = domQuery('input[name=priorityDefinitionPriority]', container);
        changeInput(priorityInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getPriorityDefinition(userTask).get('priority')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(3);
      })
    );

  });

  describe('integration', function() {

    describe('removing priority definition when empty', function() {

      it('removing zeebe:priority', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_4');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const priorityInput = domQuery('[data-entry-id="priorityDefinitionPriority"] [role="textbox"]', container);

        await setEditorValue(priorityInput, '');

        // then
        expect(getPriorityDefinition(userTask)).not.to.exist;
      }));

    });

  });

});
