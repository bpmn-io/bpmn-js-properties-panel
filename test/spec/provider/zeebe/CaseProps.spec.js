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

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';

import diagramXML from './CaseProps.bpmn';
import processDiagramXML from './CaseProcessProps.bpmn';

const testModules = [
  CoreModule,
  SelectionModule,
  ModelingModule,
  BpmnPropertiesPanel,
  ZeebePropertiesProvider
];

const moddleExtensions = {
  zeebe: zeebeModdleExtensions
};


describe('provider/zeebe - CaseProps', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('on participant', function() {

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should display case group', inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get('Participant_Case'));
      });

      // then
      expect(domQuery('[data-group-id="group-case"]', container)).to.exist;
      expect(domQuery('[data-entry-id="case"]', container)).to.exist;
    }));


    it('should NOT display case group for non-process element', inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get('Collaboration_1'));
      });

      // then
      expect(domQuery('[data-group-id="group-case"]', container)).not.to.exist;
    }));


    it('should display marker values', inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get('Participant_Case'));
      });

      // then
      expect(domQuery('#bio-properties-panel-case', container).checked).to.be.true;
      expect(domQuery('input[name=caseTitle]', container).value).to.eql('loanTitle');
      expect(domQuery('input[name=caseForm]', container).value).to.eql('loan-case-details');
    }));


    it('should NOT display title and form when not a case', inject(async function(elementRegistry, selection) {

      // when
      await act(() => {
        selection.select(elementRegistry.get('Participant_NoCase'));
      });

      // then
      expect(domQuery('#bio-properties-panel-case', container).checked).to.be.false;
      expect(domQuery('input[name=caseTitle]', container)).not.to.exist;
      expect(domQuery('input[name=caseForm]', container)).not.to.exist;
    }));


    it('should add marker', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_NoCase');

      await act(() => {
        selection.select(participant);
      });

      // when
      await act(() => {
        domQuery('#bio-properties-panel-case', container).click();
      });

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')).to.have.length(1);
      expect(domQuery('input[name=caseTitle]', container)).to.exist;
    }));


    it('should remove marker', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_Case');

      await act(() => {
        selection.select(participant);
      });

      // when
      await act(() => {
        domQuery('#bio-properties-panel-case', container).click();
      });

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')).to.be.empty;
      expect(domQuery('input[name=caseTitle]', container)).not.to.exist;
    }));


    it('should update title', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_Case');

      await act(() => {
        selection.select(participant);
      });

      // when
      changeInput(domQuery('input[name=caseTitle]', container), 'otherTitle');

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')[0].get('title')).to.eql('otherTitle');
    }));


    it('should update case form', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_Case');

      await act(() => {
        selection.select(participant);
      });

      // when
      changeInput(domQuery('input[name=caseForm]', container), 'other-form');

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')[0].get('caseForm')).to.eql('other-form');
    }));


    it('should clear case form', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_Case');

      await act(() => {
        selection.select(participant);
      });

      // when
      changeInput(domQuery('input[name=caseForm]', container), '');

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')[0].get('caseForm')).not.to.exist;
    }));


    it('should undo', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const participant = elementRegistry.get('Participant_NoCase');

      await act(() => {
        selection.select(participant);
      });

      await act(() => {
        domQuery('#bio-properties-panel-case', container).click();
      });

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      const process = getBusinessObject(participant).get('processRef');

      expect(getExtensionElementsList(process, 'zeebe:Case')).to.be.empty;
    }));

  });


  describe('on process', function() {

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should display case group', inject(async function(canvas, selection) {

      // when
      await act(() => {
        selection.select(canvas.getRootElement());
      });

      // then
      expect(domQuery('[data-group-id="group-case"]', container)).to.exist;
      expect(domQuery('#bio-properties-panel-case', container).checked).to.be.true;
    }));

  });

});
