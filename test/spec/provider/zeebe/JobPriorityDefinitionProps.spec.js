import { expect } from 'chai';
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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './JobPriorityDefinitionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';
import { getExtensionElementsList } from '../../../../src/utils/ExtensionElementsUtil';


describe('provider/zeebe - JobPriorityDefinitionProps', function() {

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


  describe('zeebe:jobPriorityDefinition', function() {

    it('should NOT display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTaskJobWorker');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.not.exist;
    }));


    it('should display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('WithPriorityDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.exist;

      // is FEEL input
      const input = domQuery('[role="textbox"]', entry);
      expect(input).to.exist;

      const jobPriorityDefinition = getJobPriorityDefinition(serviceTask);
      const feelExpression = jobPriorityDefinition.get('priority').substring(1);

      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should display for process', inject(async function(canvas, selection) {

      // given
      await act(() => {
        selection.select();
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('WithPriorityDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);

      await setEditorValue(priorityInput, 'newValue');

      // then
      // keep FEEL configuration
      expect(getJobPriorityDefinition(serviceTask).get('priority')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('WithPriorityDefinition');
        const originalValue = getJobPriorityDefinition(serviceTask).get('priority');

        await act(() => {
          selection.select(serviceTask);
        });
        const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);
        await setEditorValue(priorityInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(`=${priorityInput.textContent}`).to.eql(originalValue);
      })
    );


    it('should create jobPriorityDefinition when none exists',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('NoPriorityDefinition');

        // assume
        expect(getExtensionElementsList(getBusinessObject(serviceTask), 'zeebe:JobPriorityDefinition')).to.be.empty;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, 'newValue');

        // then
        const jobPriorityDefinitionElement = getExtensionElementsList(getBusinessObject(serviceTask), 'zeebe:JobPriorityDefinition')[0];
        expect(jobPriorityDefinitionElement).to.exist;
      })
    );


    it('should create extension elements when they do not exist',
      inject(async function(canvas, selection) {

        // given
        const process = canvas.getRootElement();

        // assume
        expect(getBusinessObject(process).get('extensionElements')).not.to.exist;

        await act(() => {
          selection.select();
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, 'newValue');

        // then
        expect(getBusinessObject(process).get('extensionElements')).to.exist;
        expect(getJobPriorityDefinition(process).get('priority')).to.eql('newValue');
      })
    );


    it('should re-use existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('NoPriorityDefinition');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
        expect(getJobPriorityDefinition(serviceTask)).not.to.exist;

        const initialExtensionElementsLength = getBusinessObject(serviceTask).get('extensionElements').get('values').length;
        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(serviceTask).get('extensionElements');
        expect(getJobPriorityDefinition(serviceTask).get('priority')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(initialExtensionElementsLength + 1);
      })
    );

  });

  describe('integration', function() {

    it('should remove job priority definition when priority is erased', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('WithPriorityDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);
      await setEditorValue(priorityInput, '');

      // then
      expect(getJobPriorityDefinition(serviceTask)).not.to.exist;
    }));

  });

});


// helper ///////////////////////

function getJobPriorityDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:JobPriorityDefinition')[0];
}
