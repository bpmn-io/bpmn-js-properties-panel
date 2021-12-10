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
import SelectEntryionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';
import BpmnPropertiesProvider from 'src/provider/bpmn';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElementsList
} from 'src/provider/zeebe/utils/ExtensionElementsUtil';

import diagramXML from './MultiInstanceProps.bpmn';


describe('provider/zeebe - MultiInstanceProps', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    SelectEntryionModule,
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
    debounceInput: false
  }));


  describe('bpmn:ServiceTask#inputCollection', function() {

    it('should NOT display for no loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputCollection]', container);

        // then
        expect(input).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-inputCollection]', container);

      // then
      expect(input.value).to.eql(
        getZeebeLoopCharacteristics(serviceTask).get('inputCollection')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-inputCollection]', container);
      changeInput(input, 'newValue');

      // then
      expect(getZeebeLoopCharacteristics(serviceTask).get('inputCollection')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getZeebeLoopCharacteristics(serviceTask).get('inputCollection');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=multiInstance-inputCollection]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noExtensionElements');

        // assume
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputCollection]', container);
        changeInput(input, 'newValue');

        // then
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing zeebe loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noZeebeLoops');

        // assume
        expect(getZeebeLoopCharacteristics(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputCollection]', container);
        changeInput(input, 'newValue');

        // then
        expect(getZeebeLoopCharacteristics(serviceTask).get('inputCollection')).to.eql('newValue');
      })
    );

  });


  describe('bpmn:ServiceTask#inputElement', function() {

    it('should NOT display for no loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputElement]', container);

        // then
        expect(input).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-inputElement]', container);

      // then
      expect(input.value).to.eql(
        getZeebeLoopCharacteristics(serviceTask).get('inputElement')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-inputElement]', container);
      changeInput(input, 'newValue');

      // then
      expect(getZeebeLoopCharacteristics(serviceTask).get('inputElement')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getZeebeLoopCharacteristics(serviceTask).get('inputElement');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=multiInstance-inputElement]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noExtensionElements');

        // assume
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputElement]', container);
        changeInput(input, 'newValue');

        // then
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing zeebe loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noZeebeLoops');

        // assume
        expect(getZeebeLoopCharacteristics(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-inputElement]', container);
        changeInput(input, 'newValue');

        // then
        expect(getZeebeLoopCharacteristics(serviceTask).get('inputElement')).to.eql('newValue');
      })
    );

  });


  describe('bpmn:ServiceTask#outputCollection', function() {

    it('should NOT display for no loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputCollection]', container);

        // then
        expect(input).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-outputCollection]', container);

      // then
      expect(input.value).to.eql(
        getZeebeLoopCharacteristics(serviceTask).get('outputCollection')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-outputCollection]', container);
      changeInput(input, 'newValue');

      // then
      expect(getZeebeLoopCharacteristics(serviceTask).get('outputCollection')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getZeebeLoopCharacteristics(serviceTask).get('outputCollection');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=multiInstance-outputCollection]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noExtensionElements');

        // assume
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputCollection]', container);
        changeInput(input, 'newValue');

        // then
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing zeebe loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noZeebeLoops');

        // assume
        expect(getZeebeLoopCharacteristics(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputCollection]', container);
        changeInput(input, 'newValue');

        // then
        expect(getZeebeLoopCharacteristics(serviceTask).get('outputCollection')).to.eql('newValue');
      })
    );

  });


  describe('bpmn:ServiceTask#outputElement', function() {

    it('should NOT display for no loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputElement]', container);

        // then
        expect(input).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-outputElement]', container);

      // then
      expect(input.value).to.eql(
        getZeebeLoopCharacteristics(serviceTask).get('outputElement')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=multiInstance-outputElement]', container);
      changeInput(input, 'newValue');

      // then
      expect(getZeebeLoopCharacteristics(serviceTask).get('outputElement')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getZeebeLoopCharacteristics(serviceTask).get('outputElement');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=multiInstance-outputElement]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noExtensionElements');

        // assume
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputElement]', container);
        changeInput(input, 'newValue');

        // then
        expect(getLoopCharacteristics(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing zeebe loop characteristics',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noZeebeLoops');

        // assume
        expect(getZeebeLoopCharacteristics(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const input = domQuery('input[name=multiInstance-outputElement]', container);
        changeInput(input, 'newValue');

        // then
        expect(getZeebeLoopCharacteristics(serviceTask).get('outputElement')).to.eql('newValue');
      })
    );

  });

});


// helper //////////////////

function getLoopCharacteristics(element) {
  const businessObject = getBusinessObject(element);
  return businessObject.get('loopCharacteristics');
}

function getZeebeLoopCharacteristics(element) {
  const loopCharacteristics = getLoopCharacteristics(element);

  const extensionElements = getExtensionElementsList(loopCharacteristics, 'zeebe:LoopCharacteristics');

  return extensionElements && extensionElements[0];
}
