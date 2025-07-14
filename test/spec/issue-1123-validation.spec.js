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

describe('Issue #1123 - Custom Header Provider', function() {

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

    it('should render default header for task elements', inject(async function(elementRegistry, selection) {
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
              getTypeLabel: () => 'Custom Task Type',
              getElementLabel: (element) => `📋 ${element.businessObject.name || element.id}`,
              getElementIcon: () => () => '<span class="custom-icon">📋</span>'
            };
          };
        } ]
      }
    ];

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: customTestModules,
      moddleExtensions: {}
    }));

    it('should allow custom styling based on element type', inject(async function(elementRegistry, selection) {
      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);
      const labelElement = domQuery('.bio-properties-panel-header-label', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Custom Task Type');
      expect(labelElement.textContent).to.equal('📋 task');
    }));

  });

  describe('custom header provider with Font Awesome icons', function() {

    const iconTestModules = [
      CoreModule,
      SelectionModule,
      ModelingModule,
      BpmnPropertiesPanel,
      BpmnPropertiesProvider,
      DefaultHeaderProviderModule,
      {
        __init__: [ 'propertiesPanelHeaderProvider' ],
        propertiesPanelHeaderProvider: [ 'type', function FontAwesomeHeaderProvider() {
          this.getHeaderProvider = function() {
            return {
              getIcon: () => null,
              getTypeLabel: () => 'Service Task',
              getElementLabel: (element) => element.businessObject.name || element.id,
              getElementIcon: () => () => '<i class="fa fa-cogs" style="color: green;"></i>'
            };
          };
        } ]
      }
    ];

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: iconTestModules,
      moddleExtensions: {}
    }));

    it('should allow custom HTML for Font Awesome icons', inject(async function(elementRegistry, selection) {
      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);
      const iconElement = domQuery('.bio-properties-panel-header-icon', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Service Task');
      expect(iconElement).to.exist;
      // The icon should contain the custom HTML
      expect(iconElement.innerHTML).to.contain('fa fa-cogs');
    }));

  });

  describe('element type-specific header provider', function() {

    const typeSpecificModules = [
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
          getTypeLabel: (element) => {
            if (element.businessObject.$type === 'bpmn:Task') {
              return 'Task Element';
            }
            if (element.businessObject.$type === 'bpmn:StartEvent') {
              return 'Start Event Element';
            }
            return 'Generic Element';
          },
          getElementLabel: (element) => {
            if (element.businessObject.$type === 'bpmn:Task') {
              return `📋 ${element.businessObject.name || element.id}`;
            }
            return element.businessObject.name || element.id;
          },
          getElementIcon: (element) => {
            if (element.businessObject.$type === 'bpmn:Task') {
              return () => '<span class="custom-icon">📋</span>';
            }
            if (element.businessObject.$type === 'bpmn:StartEvent') {
              return () => '<span class="custom-icon">▶️</span>';
            }
            return null;
          }
        } ]
      }
    ];

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: typeSpecificModules,
      moddleExtensions: {}
    }));

    it('should handle element type-specific styling for tasks', inject(async function(elementRegistry, selection) {
      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);
      const labelElement = domQuery('.bio-properties-panel-header-label', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Task Element');
      expect(labelElement.textContent).to.equal('📋 task');
    }));

    it('should handle element type-specific styling for start events', inject(async function(elementRegistry, selection) {
      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const headerElement = domQuery('.bio-properties-panel-header', container);
      const typeElement = domQuery('.bio-properties-panel-header-type', container);
      const labelElement = domQuery('.bio-properties-panel-header-label', container);

      // then
      expect(headerElement).to.exist;
      expect(typeElement).to.exist;
      expect(typeElement.textContent).to.equal('Start Event Element');
      expect(labelElement.textContent).to.equal('start');
    }));

  });

});
