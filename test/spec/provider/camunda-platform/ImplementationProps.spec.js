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

import {
  getServiceTaskLikeBusinessObject
} from 'src/provider/camunda-platform/utils/ImplementationTypeUtils';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ImplementationProps.bpmn';


describe('provider/camunda-platform - ImplementationProps', function() {

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


  describe('bpmn:ServiceTask#class', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(serviceTask).get('camunda:class')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);
      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(serviceTask).get('camunda:class')).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = domQuery('input[name=javaClass]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const camundaClass = getBusinessObject(serviceTask).get('camunda:class');

      expect(camundaClass).to.exist;
      expect(camundaClass).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_class');

        const originalValue = getBusinessObject(serviceTask).get('camunda:class');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=javaClass]', container);
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


  describe('bpmn:MessageEventDefinition#class', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_External');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Class');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);

      // then
      expect(input.value).to.eql(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Class');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=javaClass]', container);
      changeInput(input, 'newValue');

      // then
      expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = domQuery('input[name=javaClass]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const camundaClass = getBusinessObject(serviceTask).get('camunda:class');

      expect(camundaClass).to.exist;
      expect(camundaClass).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_Class');

        const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=javaClass]', container);
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


  describe('bpmn:ServiceTask#expression', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expression]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expression]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(serviceTask).get('camunda:expression')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expression]', container);
      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(serviceTask).get('camunda:expression')).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = domQuery('input[name=expression]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const expression = getBusinessObject(serviceTask).get('camunda:expression');

      expect(expression).to.exist;
      expect(expression).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_expression');

        const originalValue = getBusinessObject(serviceTask).get('camunda:expression');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=expression]', container);
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


  describe('bpmn:MessageEventDefinition#expression', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_Class');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expression]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expression]', container);

      // then
      expect(input.value).to.eql(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:expression')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expression]', container);
      changeInput(input, 'newValue');

      // then
      expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:expression')).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      const input = domQuery('input[name=expression]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const expression = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:expression');

      expect(expression).to.exist;
      expect(expression).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

        const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:expression');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=expression]', container);
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


  describe('bpmn:ServiceTaskL#resultVariable', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(serviceTask).get('camunda:resultVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_expression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(serviceTask).get('camunda:resultVariable')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_expression');

        const originalValue = getBusinessObject(serviceTask).get('camunda:resultVariable');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=expressionResultVariable]', container);
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


  describe('bpmn:MessageEventDefinition#resultVariable', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_Class');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);

      // then
      expect(input.value).to.eql(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:resultVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=expressionResultVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:resultVariable')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

        const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:resultVariable');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=expressionResultVariable]', container);
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


  describe('bpmn:ServiceTask#delegateExpression', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_delegateExpression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(serviceTask).get('camunda:delegateExpression')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_delegateExpression');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(serviceTask).get('camunda:delegateExpression')
      ).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_delegateExpression');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = domQuery('input[name=delegateExpression]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const delegateExpression = getBusinessObject(serviceTask).get('camunda:delegateExpression');

      expect(delegateExpression).to.exist;
      expect(delegateExpression).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_delegateExpression');

        const originalValue = getBusinessObject(serviceTask).get('camunda:delegateExpression');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=delegateExpression]', container);
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


  describe('bpmn:MessageEventDefinition#delegateExpression', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_Expression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_DelegateExpression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);

      // then
      expect(input.value).to.eql(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:delegateExpression')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_DelegateExpression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=delegateExpression]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:delegateExpression')
      ).to.eql('newValue');
    }));


    it('should NOT delete property on empty value', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_DelegateExpression');

      await act(() => {
        selection.select(messageEvent);
      });

      const input = domQuery('input[name=delegateExpression]', container);
      changeInput(input, 'newValue');

      // when
      changeInput(input, '');

      // then
      const delegateExpression = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:delegateExpression');

      expect(delegateExpression).to.exist;
      expect(delegateExpression).eql('');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_DelegateExpression');

        const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:delegateExpression');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=delegateExpression]', container);
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


  describe('bpmn:ServiceTas#topic', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_external');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(serviceTask).get('camunda:topic')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_external');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);
      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(serviceTask).get('camunda:topic')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_external');

        const originalValue = getBusinessObject(serviceTask).get('camunda:topic');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=externalTopic]', container);
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


  describe('bpmn:MessageEventDefinition#topic', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_DelegateExpression');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_External');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);

      // then
      expect(input.value).to.eql(
        getServiceTaskLikeBusinessObject(messageEvent).get('camunda:topic')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_External');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=externalTopic]', container);
      changeInput(input, 'newValue');

      // then
      expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:topic')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_External');

        const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:topic');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=externalTopic]', container);
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


  describe('bpmn:ServiceTask#connectorId', function() {

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
      const serviceTask = elementRegistry.get('ServiceTask_class');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_connector');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);

      // then
      expect(input.value).to.eql(getConnector(serviceTask).get('camunda:connectorId'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_connector');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);
      changeInput(input, 'newValue');

      // then
      expect(getConnector(serviceTask).get('camunda:connectorId')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_connector');

        const originalValue = getConnector(serviceTask).get('camunda:connectorId');

        await act(() => {
          selection.select(serviceTask);
        });
        const input = domQuery('input[name=connectorId]', container);
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


  describe('bpmn:MessageEventDefinition#connectorId', function() {

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
      const messageEvent = elementRegistry.get('MessageEndEvent_Class');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);

      // then
      expect(input.value).to.eql(getConnector(messageEvent).get('camunda:connectorId'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const input = domQuery('input[name=connectorId]', container);
      changeInput(input, 'newValue');

      // then
      expect(getConnector(messageEvent).get('camunda:connectorId')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

        const originalValue = getConnector(messageEvent).get('camunda:connectorId');

        await act(() => {
          selection.select(messageEvent);
        });
        const input = domQuery('input[name=connectorId]', container);
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


// helper /////////////////////

function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}

function getConnector(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors(businessObject);

  return connectors[0];
}