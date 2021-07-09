import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProviderModule from 'src/provider/camunda-platform';
import BpmnPropertiesProviderModule from 'src/provider/bpmn';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './CamundaPlatformPropertiesProvider.bpmn';


describe('<CamundaPlatformPropertiesProvider>', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    CamundaPlatformPropertiesProviderModule
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('basics', function() {

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should render', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // then
      await act(() => {
        selection.select(task);
      });
    }));
  });


  describe('integration', function() {

    it('should work with BpmnPropertiesProvider', function() {

      // given
      const test = bootstrapPropertiesPanel(diagramXML, {
        modules: testModules.concat(BpmnPropertiesProviderModule),
        moddleExtensions,
        debounceInput: false
      });

      // then
      return test.call(this);
    });
  });
});
