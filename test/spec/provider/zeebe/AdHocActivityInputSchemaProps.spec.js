import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import { bootstrapPropertiesPanel, inject } from 'test/TestHelper';

import { query as domQuery } from 'min-dom';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import BpmnPropertiesPanel from 'src/render';
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';
import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './AdHocActivityInputSchemaProps.bpmn';
import { setEditorValue } from '../../../TestHelper';
import { getExtensionElementsList } from '../../../../src/utils/ExtensionElementsUtil';

describe('provider/zeebe - AdHocActivityInputSchema', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    SelectionModule,
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
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));


  describe('bpmn:FlowNode#camunda:adHocActivityInputSchema', function() {
    const rootActivities = {
      'Task_With_Input_Schema': 'Task with input schema',
      'Task_Without_Input_Schema': 'Task without input schema',
      'First_Task': 'Task with follow-up task',
      'An_Event': 'Intermediate event'
    };

    const nonRootActivities = {
      'Second_Task': 'Follow-up task to First_Task',
      'Event_Follow_Up_Task': 'Follow-up task to An_Event',
    };

    describe('should display the input schema field on root activities within an ad-hoc subprocess', function() {
      for (const [ activityId, testCaseDescription ] of Object.entries(rootActivities)) {
        it(testCaseDescription, inject(async function(
            elementRegistry,
            selection
        ) {

          // given
          const activity = elementRegistry.get(activityId);

          // when
          await act(() => {
            selection.select(activity);
          });

          // then
          const group = getGroup(container, 'documentation');
          expect(group).to.exist;
          expect(getAdHocActivityInputSchemaInput(container)).to.exist;
        }));
      }
    });

    describe('should NOT display the input schema field on non-root activities within an ad-hoc subprocess', function() {
      for (const [ activityId, testCaseDescription ] of Object.entries(nonRootActivities)) {
        it(testCaseDescription, inject(async function(
            elementRegistry,
            selection
        ) {

          // given
          const activity = elementRegistry.get(activityId);

          // when
          await act(() => {
            selection.select(activity);
          });

          // then
          const group = getGroup(container, 'documentation');
          expect(group).to.exist;
          expect(getAdHocActivityInputSchemaInput(container)).not.to.exist;
        }));
      }
    });

    it('should NOT display the input schema field on activities outside an ad-hoc subprocess', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Normal_Task');

      // when
      await act(() => {
        selection.select(activity);
      });

      // then
      const group = getGroup(container, 'documentation');
      expect(group).to.exist;
      expect(getAdHocActivityInputSchemaInput(container)).not.to.exist;
    }));


    it('should show the expected value when an input schema is configured', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Task_With_Input_Schema');

      // when
      await act(() => {
        selection.select(activity);
      });

      // then
      expect(getAdHocActivityInputSchemaProperty(activity)).to.exist;

      const input = getAdHocActivityInputSchemaInput(container);
      expect(input).to.exist;
      expect('=' + getEditorValue(input)).to.equal(getAdHocActivityInputSchemaValue(activity));
    }));

    it('should be empty when no input schema is configured', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Task_Without_Input_Schema');

      // when
      await act(() => {
        selection.select(activity);
      });

      // then
      expect(getAdHocActivityInputSchemaProperty(activity)).not.to.exist;

      const input = getAdHocActivityInputSchemaInput(container);
      expect(input).to.exist;
      expect(getEditorValue(input)).to.be.empty;
    }));

    it('should update - reusing existing property', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Task_With_Input_Schema');

      await act(() => {
        selection.select(activity);
      });

      // when
      const input = getAdHocActivityInputSchemaInput(container);
      await setEditorValue(input, '{"type": "array"}');

      // then
      expect(getAdHocActivityInputSchemaValue(activity)).to.equal('={"type": "array"}');
    }));


    it('should update - creating new property', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Task_Without_Input_Schema');

      await act(() => {
        selection.select(activity);
      });

      // when
      const input = getAdHocActivityInputSchemaInput(container);
      await setEditorValue(input, '{"type": "array"}');

      // then
      expect(getAdHocActivityInputSchemaValue(activity)).to.equal('={"type": "array"}');
    }));

    it('should update - remove property', inject(async function(
        elementRegistry,
        selection
    ) {

      // given
      const activity = elementRegistry.get('Task_With_Input_Schema');

      await act(() => {
        selection.select(activity);
      });

      // when
      const input = getAdHocActivityInputSchemaInput(container);
      await setEditorValue(input, '');

      // then
      expect(getAdHocActivityInputSchemaProperty(activity)).not.to.exist;
    }));

    it('should update on external change', inject(async function(
        elementRegistry,
        selection,
        commandStack
    ) {

      // given
      const activity = elementRegistry.get('Task_With_Input_Schema');
      const originalValue = getAdHocActivityInputSchemaValue(activity);

      await act(() => {
        selection.select(activity);
      });
      const input = getAdHocActivityInputSchemaInput(container);
      await setEditorValue(input, '{"type": "array"}');
      expect(getAdHocActivityInputSchemaValue(activity)).to.equal('={"type": "array"}');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getAdHocActivityInputSchemaValue(activity)).to.equal(originalValue);
    }));
  });
});


// DOM helpers ////////////////////////////

function getEditorValue(input) {
  return input.textContent;
}

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getAdHocActivityInputSchemaInput(container) {
  return domQuery('[name=adHocActivityInputSchema] [role="textbox"]', container);
}

// model helpers ////////////////////////////

function getZeebeProperties(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:Properties')[0];
}

function getZeebeProperty(element, propertyName) {
  const properties = getZeebeProperties(element);
  if (!properties) {
    return;
  }

  return properties.get('properties').find(p => p.get('name') === propertyName);
}

function getAdHocActivityInputSchemaProperty(element) {
  return getZeebeProperty(element, 'camunda:adHocActivityInputSchema');
}

function getAdHocActivityInputSchemaValue(element) {
  const property = getAdHocActivityInputSchemaProperty(element);
  if (property) {
    return property.get('value');
  }
}