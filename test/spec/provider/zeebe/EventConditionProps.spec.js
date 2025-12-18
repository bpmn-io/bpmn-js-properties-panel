import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
  inject,
  setEditorValue
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './EventConditionProps.bpmn';

import { getConditionalFilter } from 'src/provider/zeebe/properties/EventConditionProps';
import { getConditionBody } from 'src/utils/ConditionUtil';


describe('provider/zeebe - EventConditionProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
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


  describe('bpmn:condition', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      // when
      await act(() => {
        selection.select(element);
      });

      const input = domQuery('[id=bio-properties-panel-condition]', container);

      // then
      expect(input).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      await act(() => {
        selection.select(element);
      });

      const input = domQuery('[data-entry-id="condition"] [role="textbox"]', container);

      // when
      await setEditorValue(input, 'myExpression');

      const conditionValue = getConditionBody(element);

      // then
      expect(conditionValue).to.exist;
      expect(conditionValue).to.equal('=myExpression');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Event_1');
        const originalValue = getConditionBody(element);

        await act(() => {
          selection.select(element);
        });

        const input = domQuery('[data-entry-id="condition"] [role="textbox"]', container);

        await setEditorValue(input, 'myExpression');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const conditionValue = getConditionBody(element);
        expect(conditionValue).to.eql(originalValue);
      })
    );
  });


  describe('zeebe:EventConditionProps#variableNames', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      // when
      await act(() => {
        selection.select(element);
      });

      const input = domQuery('input[name=variableNames]', container);

      // then
      expect(input).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery('input[name=variableNames]', container);
      changeInput(input, 'foo,baz');

      // then
      const conditionalFilter = getConditionalFilter(element);
      expect(conditionalFilter.variableNames).to.eql('foo,baz');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Event_2');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery('input[name=variableNames]', container);
        changeInput(input, 'baz,bax');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql('foo,bar');
      })
    );

  });


  describe('zeebe:EventConditionProps#variableEvents', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_2');

      // when
      await act(() => {
        selection.select(element);
      });

      const createCheckbox = domQuery('input[name=variableEvents-create]', container);
      const updateCheckbox = domQuery('input[name=variableEvents-update]', container);

      // then
      expect(createCheckbox).to.exist;
      expect(updateCheckbox).to.exist;
    }));


    it('should not display on root level', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      // when
      await act(() => {
        selection.select(element);
      });

      const createCheckbox = domQuery('input[name=variableEvents-create]', container);
      const updateCheckbox = domQuery('input[name=variableEvents-update]', container);

      // then
      expect(createCheckbox).not.to.exist;
      expect(updateCheckbox).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_2');

      await act(() => {
        selection.select(element);
      });

      // when
      const createCheckbox = domQuery('input[name=variableEvents-create]', container);
      const updateCheckbox = domQuery('input[name=variableEvents-update]', container);

      clickInput(createCheckbox);
      clickInput(updateCheckbox);

      // then
      const conditionalFilter = getConditionalFilter(element);
      expect(conditionalFilter.variableEvents).to.eql('create,update');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Event_2');
        const originalValue = getConditionalFilter(element)?.variableEvents;

        await act(() => {
          selection.select(element);
        });

        const createCheckbox = domQuery('input[name=variableEvents-create]', container);

        clickInput(createCheckbox);

        // assume
        expect(getConditionalFilter(element).variableEvents).to.eql('create');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(getConditionalFilter(element)?.variableEvents).to.eql(originalValue);
      })
    );
  });

});