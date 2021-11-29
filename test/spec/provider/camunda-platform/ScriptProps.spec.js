import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

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

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ScriptProps.bpmn';


describe('provider/camunda-platform - ScriptProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('bpmn:ScriptTask#scriptFormat', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=scriptFormat]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptFormat]', container);

      // then
      expect(input.value).to.eql(getBusinessObject(scriptTask).get('scriptFormat'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptFormat]', container);
      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(scriptTask).get('scriptFormat')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        const originalValue = getBusinessObject(scriptTask).get('scriptFormat');

        await act(() => {
          selection.select(scriptTask);
        });
        const input = domQuery('input[name=scriptFormat]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ScriptTask#scriptType', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=scriptType]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const select = domQuery('select[name=scriptType]', container);

      // then
      expect(select.value).to.eql('script');
    }));


    it('should update - resource', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // assume
      expect(getBusinessObject(scriptTask).get('camunda:resource')).to.be.undefined;

      // when
      const select = domQuery('select[name=scriptType]', container);
      changeInput(select, 'resource');

      // then
      expect(getBusinessObject(scriptTask).get('camunda:resource')).to.exist;
    }));


    it('should update - script', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(scriptTask);
      });

      // assume
      expect(getBusinessObject(scriptTask).get('script')).to.be.undefined;

      // when
      const select = domQuery('select[name=scriptType]', container);
      changeInput(select, 'script');

      // then
      expect(getBusinessObject(scriptTask).get('script')).to.exist;
    }));


    it('should clean up values', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_3');

      await act(() => {
        selection.select(scriptTask);
      });

      // assume
      expect(getBusinessObject(scriptTask).get('script')).to.exist;
      expect(getBusinessObject(scriptTask).get('camunda:resource')).to.exist;

      // when
      const select = domQuery('select[name=scriptType]', container);
      changeInput(select, '');

      // then
      expect(getBusinessObject(scriptTask).get('script')).to.be.undefined;
      expect(getBusinessObject(scriptTask).get('camunda:resource')).to.be.undefined;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        const originalValue = getBusinessObject(scriptTask).get('script');

        await act(() => {
          selection.select(scriptTask);
        });
        const select = domQuery('select[name=scriptType]', container);
        changeInput(select, 'resource');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(select.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ScriptTask#script', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const textarea = domQuery('textarea[name=scriptValue]', container);

      // then
      expect(textarea).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const textarea = domQuery('textarea[name=scriptValue]', container);

      // then
      expect(textarea.value).to.eql(
        getBusinessObject(scriptTask).get('script')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const textarea = domQuery('textarea[name=scriptValue]', container);
      changeInput(textarea, 'newValue');

      // then
      expect(getBusinessObject(scriptTask).get('script')).to.eql('newValue');
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const textarea = domQuery('textarea[name=scriptValue]', container);
      changeInput(textarea, '');

      // then
      expect(getBusinessObject(scriptTask).get('script')).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        const originalValue = getBusinessObject(scriptTask).get('script');

        await act(() => {
          selection.select(scriptTask);
        });
        const textarea = domQuery('textarea[name=scriptValue]', container);
        changeInput(textarea, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(textarea.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ScriptTask#resource', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResource]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResource]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(scriptTask).get('camunda:resource')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResource]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(scriptTask).get('camunda:resource')
      ).to.eql('newValue');
    }));


    it('should NOT set to undefined', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const input = domQuery('input[name=scriptResource]', container);
      changeInput(input, '');

      // then
      expect(getBusinessObject(scriptTask).get('camunda:resource')).to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_2');

        const originalValue =
          getBusinessObject(scriptTask).get('camunda:resource');

        await act(() => {
          selection.select(scriptTask);
        });
        const input = domQuery('input[name=scriptResource]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });

});