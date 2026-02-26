import TestContainer from 'mocha-test-container-support';

import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
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

import DefaultHeaderProviderModule from 'src/render/DefaultHeaderProviderModule';

import diagramXML from 'test/fixtures/simple.bpmn';


describe('CustomHeaderProvider', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    DefaultHeaderProviderModule
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions: {}
  }));


  describe('default header provider', function() {

    it('should render default header', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const iconElement = domQuery('.bio-properties-panel-header-icon', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);

      // then
      expect(headerElement).to.exist;
      expect(iconElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Task');
    }));

  });

  describe('custom header provider service', function() {

    const customTestModules = [
      CoreModule,
      SelectionModule,
      ModelingModule,
      BpmnPropertiesPanel,
      BpmnPropertiesProvider,
      DefaultHeaderProviderModule,
      {
        __init__: [ 'propertiesPanelHeaderProvider' ],
        propertiesPanelHeaderProvider: [ 'type', function CustomHeaderProviderService() {
          this.getHeaderProvider = function() {
            return {
              getIcon: () => null,
              getTypeLabel: () => 'Custom Element',
              getElementLabel: (element) => element.id,
              getElementIcon: () => null
            };
          };
        } ]
      }
    ];

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: customTestModules,
      moddleExtensions: {}
    }));

    it('should render custom header provider', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Custom Element');
    }));

  });

  describe('custom header provider object', function() {

    const objectTestModules = [
      CoreModule,
      SelectionModule,
      ModelingModule,
      BpmnPropertiesPanel,
      BpmnPropertiesProvider,
      DefaultHeaderProviderModule,
      {
        __init__: [ 'propertiesPanelHeaderProvider' ],
        propertiesPanelHeaderProvider: [ 'value', {
          getIcon: () => null,
          getTypeLabel: (element) => `Direct: ${element.id}`,
          getElementLabel: (element) => element.id,
          getElementIcon: () => null
        } ]
      }
    ];

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: objectTestModules,
      moddleExtensions: {}
    }));

    it('should render direct header provider object', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Direct: Task_1');
    }));

  });

});
