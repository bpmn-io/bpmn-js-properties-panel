import { expect } from 'chai';
import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessId,
  hasBusinessId
} from 'src/provider/zeebe/utils/CalledElementUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './BusinessIdProps.bpmn';


describe('provider/zeebe - BusinessIdProps', function() {

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


  describe('#businessIdInherit', function() {

    it('should display for CallActivity', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_inherit');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const toggle = domQuery('[data-entry-id=businessIdInherit]', container);

      expect(toggle).to.exist;
    }));


    it('should not display for non-CallActivity', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      await act(() => {
        selection.select(task);
      });

      // then
      const toggle = domQuery('[data-entry-id=businessIdInherit]', container);

      expect(toggle).to.not.exist;
    }));


    it('should be on when Business ID is inherited', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_inherit');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const input = domQuery('#bio-properties-panel-businessIdInherit', container);

      expect(input.checked).to.be.true;
    }));


    it('should be off when Business ID is overridden', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_override');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const input = domQuery('#bio-properties-panel-businessIdInherit', container);

      expect(input.checked).to.be.false;
    }));


    it('should be off for empty (null) override', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_empty');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const input = domQuery('#bio-properties-panel-businessIdInherit', container);

      expect(input.checked).to.be.false;
    }));


    it('should add empty override when toggled off', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_inherit');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      expect(hasBusinessId(callActivity)).to.be.false;

      // when
      const slider = domQuery('[data-entry-id=businessIdInherit] .bio-properties-panel-toggle-switch__slider', container);

      await act(() => {
        clickInput(slider);
      });

      // then
      expect(hasBusinessId(callActivity)).to.be.true;
      expect(getBusinessId(callActivity)).to.equal('');
    }));


    it('should remove override when toggled on', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_override');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      expect(hasBusinessId(callActivity)).to.be.true;

      // when
      const slider = domQuery('[data-entry-id=businessIdInherit] .bio-properties-panel-toggle-switch__slider', container);

      await act(() => {
        clickInput(slider);
      });

      // then
      expect(hasBusinessId(callActivity)).to.be.false;
    }));


    it('should create zeebe:CalledElement when toggled off without one', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_noCalledElement');

      await act(() => {
        selection.select(callActivity);
      });

      // assume
      expect(hasBusinessId(callActivity)).to.be.false;

      // when
      const slider = domQuery('[data-entry-id=businessIdInherit] .bio-properties-panel-toggle-switch__slider', container);

      await act(() => {
        clickInput(slider);
      });

      // then
      expect(hasBusinessId(callActivity)).to.be.true;
      expect(getBusinessId(callActivity)).to.equal('');
    }));

  });


  describe('#businessId', function() {

    it('should not display when Business ID is inherited', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_inherit');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const entry = domQuery('[data-entry-id=businessId]', container);

      expect(entry).to.not.exist;
    }));


    it('should display when Business ID is overridden', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_override');

      // when
      await act(() => {
        selection.select(callActivity);
      });

      // then
      const entry = domQuery('[data-entry-id=businessId]', container);

      expect(entry).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_empty');

      await act(() => {
        selection.select(callActivity);
      });

      const input = domQuery('input[name=businessId]', container);

      // when
      changeInput(input, 'order-42');

      // then
      expect(getBusinessId(callActivity)).to.equal('order-42');
    }));


    it('should keep empty string when cleared', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_literal');

      await act(() => {
        selection.select(callActivity);
      });

      const input = domQuery('input[name=businessId]', container);

      // when
      changeInput(input, '');

      // then
      expect(getBusinessId(callActivity)).to.equal('');
    }));

  });

});
