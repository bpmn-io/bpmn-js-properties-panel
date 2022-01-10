import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  filter
} from 'min-dash';

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

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import {
  getSignalEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './InMappingPropagationProps.bpmn';


describe('provider/camunda-platform - InMappingPropagationProps', function() {

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

  describe('#inMapping-propagation', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation]', container);

      // then
      expect(input.checked).to.eql(isPropagateAll(callActivity));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation]', container);
      clickInput(input);

      // then
      expect(isPropagateAll(callActivity)).to.be.false;
    }));


    it('should remove all <variables=all> mappings',
      inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_multiple');

        await act(() => {
          selection.select(callActivity);
        });

        // assume
        expect(findRelevantInMappings(callActivity)).to.have.length(3);

        // when
        const input = domQuery('input[name=inMapping-propagation]', container);
        clickInput(input);

        // then
        expect(findRelevantInMappings(callActivity)).to.be.empty;
      })
    );


    it('should create extension elements', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_empty');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      expect(getBusinessObject(callActivity).get('extensionElements')).to.not.exist;

      // when
      const input = domQuery('input[name=inMapping-propagation]', container);
      clickInput(input);

      // then
      expect(getBusinessObject(callActivity).get('extensionElements')).to.exist;
      expect(isPropagateAll(callActivity)).to.be.true;
    }));


    it('should re-use existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_existingExtensionElements');

        await act(() => {
          selection.select(callActivity);
        });

        // assume
        expect(getBusinessObject(callActivity).get('extensionElements')).to.exist;

        // when
        const input = domQuery('input[name=inMapping-propagation]', container);
        clickInput(input);

        // then
        expect(getBusinessObject(callActivity).get('extensionElements')).to.exist;
        expect(isPropagateAll(callActivity)).to.be.true;
      })
    );


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        const originalValue = isPropagateAll(callActivity);

        await act(() => {
          selection.select(callActivity);
        });
        const input = domQuery('input[name=inMapping-propagation]', container);
        clickInput(input);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.checked).to.eql(originalValue);
      })
    );

  });


  describe('#inMapping-propagation-local', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_empty');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation-local]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation-local]', container);

      // then
      expect(input.checked).to.eql(findRelevantInMapping(callActivity).get('local'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const input = domQuery('input[name=inMapping-propagation-local]', container);
      clickInput(input);

      // then
      expect(findRelevantInMapping(callActivity).get('local')).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        const originalValue = findRelevantInMapping(callActivity).get('local');

        await act(() => {
          selection.select(callActivity);
        });
        const input = domQuery('input[name=inMapping-propagation-local]', container);
        clickInput(input);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.checked).to.eql(originalValue);
      })
    );

  });

});


// helper ///////////////

function getInMappings(element) {
  const businessObject = getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition(businessObject);
  return getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');
}

function findRelevantInMappings(element) {
  const inMappings = getInMappings(element);
  return filter(inMappings, function(mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}

function findRelevantInMapping(element) {
  const mappings = findRelevantInMappings(element);
  return mappings.length && mappings[0];
}

function isPropagateAll(element) {
  const mappings = findRelevantInMappings(element);
  return !!mappings.length;
}

