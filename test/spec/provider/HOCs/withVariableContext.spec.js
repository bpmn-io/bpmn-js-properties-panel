import TestContainer from 'mocha-test-container-support';
import { act, render, waitFor } from '@testing-library/preact';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  ZeebeVariableResolverModule
} from '@bpmn-io/variable-resolver';

import VariableProvider from '@bpmn-io/variable-resolver/lib/VariableProvider';

import { withVariableContext } from 'src/provider/HOCs';

import {
  BpmnPropertiesPanelContext
} from 'src/context';

import xml from './withVariableContext.bpmn';


/**
 * As of @bpmn-io/extract-process-variables@0.7.0, the extraction is async. To get the
 * correct process variables, we use `eventually` in all test cases.
 */
describe('HOCs - withVariableContext.js', function() {

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function bootstrap(diagramXML) {
    return bootstrapModeler(diagramXML, {
      container,
      moddleExtensions
    });
  }

  beforeEach(bootstrap(xml));


  describe('without variableResolver', function() {

    it('should supply Variables to Component', inject(async function(elementRegistry, injector) {

      // given
      const mockComponent = sinon.spy();
      const props = {
        element: elementRegistry.get('Task_1'),
      };

      // when
      createVariableComponent({
        component: mockComponent,
        props,
        context: {
          getService: injector.get
        }
      });

      // then
      await waitFor(() => {
        expect(mockComponent).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'OutputVariable_1',
              info: 'Written in Task_2'
            }
          ])
        );
      });
    }));


    it('should supply variables to extension element', inject(async function(elementRegistry, injector) {

      // given
      const mockComponent = sinon.spy();
      const bpmnElement = elementRegistry.get('Task_2');
      const ioMappings = getIoMappings(bpmnElement);

      const props = {
        bpmnElement,
        element: ioMappings.outputParameters[0]
      };

      // when
      createVariableComponent({
        component: mockComponent,
        props,
        context: {
          getService: injector.get
        },
      });

      // then
      await waitFor(() => {
        expect(mockComponent).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'InputVariable_1',
              info: 'Written in Task_2'
            },
            {
              name: 'OutputVariable_1',
              info: 'Written in Task_2'
            }
          ])
        );
      });

    }));


    it('should update variables to Component', inject(async function(elementRegistry, commandStack, injector) {

      // given
      const mockComponent = sinon.spy();

      const bpmnElement = elementRegistry.get('Task_2');

      const ioMappings = getIoMappings(bpmnElement);

      const props = {
        element: bpmnElement,
      };

      createVariableComponent({
        component: mockComponent,
        context: {
          getService: injector.get
        },
        props,
        container
      });

      const ioMapping = ioMappings.outputParameters[0];

      // when
      await act(() => {
        commandStack.execute('element.updateModdleProperties', {
          element: bpmnElement,
          moddleElement: ioMapping,
          properties: {
            target: 'newVariable'
          }
        });
      });

      // then
      await waitFor(() => {
        expect(mockComponent.lastCall).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'InputVariable_1',
              info: 'Written in Task_2'
            },
            {
              name: 'newVariable',
              info: 'Written in Task_2'
            }
          ])
        );
      });
    }));

  });


  describe('with variableResolver', function() {

    class AdditionalVariableProvider extends VariableProvider {

      getVariables(element) {
        if (!is(element, 'bpmn:Process')) {
          return;
        }

        return [
          {
            name: 'globalVariable',
            type: 'TestType',
            info: 'TestInfo'
          }
        ];

      }
    }

    const AdditionalVariableModule = {
      __init__: [
        'additionalVariableProvider',
      ],
      additionalVariableProvider: [ 'type', AdditionalVariableProvider ],
    };

    function bootstrap(diagramXML) {
      return bootstrapModeler(diagramXML, {
        container,
        moddleExtensions,
        additionalModules: [
          ZeebeVariableResolverModule,
          AdditionalVariableModule
        ]
      });
    }

    beforeEach(bootstrap(xml));

    it('should supply Variables to Component', inject(async function(elementRegistry, injector) {

      // given
      const mockComponent = sinon.spy();
      const props = {
        element: elementRegistry.get('Task_1'),
      };

      // when
      createVariableComponent({
        component: mockComponent,
        props,
        context: {
          getService: injector.get
        }
      });

      // then
      await waitFor(() => {
        expect(mockComponent).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'OutputVariable_1',
              info: 'Written in Task_2'
            },
            {
              name: 'globalVariable',
              detail: 'TestType',
              info: 'TestInfo'
            }
          ])
        );
      });
    }));


    it('should supply and filter variables to extension element', inject(async function(elementRegistry, injector) {

      // given
      const mockComponent = sinon.spy();
      const bpmnElement = elementRegistry.get('Task_2');
      const ioMappings = getIoMappings(bpmnElement);

      const props = {
        bpmnElement,
        element: ioMappings.outputParameters[0]
      };

      // when
      createVariableComponent({
        component: mockComponent,
        props,
        context: {
          getService: injector.get
        },
      });

      // then
      await waitFor(() => {
        expect(mockComponent).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'InputVariable_1',
              info: 'Written in Task_2'
            },
            {
              name: 'globalVariable',
              detail: 'TestType',
              info: 'TestInfo'
            }
          ])
        );
      });

    }));


    it('should update variables to Component', inject(async function(elementRegistry, commandStack, injector) {

      // given
      const mockComponent = sinon.spy();

      const bpmnElement = elementRegistry.get('Task_2');

      const ioMappings = getIoMappings(bpmnElement);

      const props = {
        element: bpmnElement,
      };

      createVariableComponent({
        component: mockComponent,
        context: {
          getService: injector.get
        },
        props,
        container
      });

      const ioMapping = ioMappings.inputParameters[0];

      // when
      await act(() => {
        commandStack.execute('element.updateModdleProperties', {
          element: bpmnElement,
          moddleElement: ioMapping,
          properties: {
            target: 'newVariable'
          }
        });
      });

      // then
      await waitFor(() => {
        expect(mockComponent.lastCall).to.have.been.calledWith(
          matchesVariables([
            {
              name: 'newVariable',
              info: 'Written in Task_2'
            },
            {
              name: 'globalVariable',
              detail: 'TestType',
              info: 'TestInfo'
            }
          ])
        );
      });
    }));


  });


  it('should NOT stop propagation of events when updating variables', inject(async function(elementRegistry, injector, eventBus) {

    // given
    const bpmnElement = elementRegistry.get('Task_1');
    const props = {
      element: bpmnElement,
    };

    createVariableComponent({
      component: () => {},
      context: {
        getService: injector.get
      },
      props,
      container
    });

    const commandStackChangedSpy = sinon.spy();
    eventBus.on('commandStack.changed', 0, commandStackChangedSpy);

    // when
    eventBus.fire('commandStack.changed');

    // then
    commandStackChangedSpy.should.have.been.called;
  }));

});

// helpers ////////////////////////

function createVariableComponent(options) {
  const {
    component,
    context = {
      getService: () => ({
        on: ()=>{},
        off: ()=> {} })
    },
    container,
    props
  } = options;

  const WrappedComponent = withVariableContext(component);

  return render(
    <BpmnPropertiesPanelContext.Provider value={ context }>
      <WrappedComponent { ...props } />
    </BpmnPropertiesPanelContext.Provider>,
    {
      container
    }
  );
}


function getIoMappings(element) {
  const bo = element.businessObject;
  const extensionElements = bo.get('extensionElements');

  return extensionElements.get('values').find(value => {
    return is(value, 'zeebe:IoMapping');
  });

}


const matchesVariables = expectedVariables => sinon.match(({ variables }) => {

  if (variables.length !== expectedVariables.length) {
    return false;
  }

  return variables.every((variable) => {
    const expectedVariable = expectedVariables.find((expectedVariable) => {
      return expectedVariable.name === variable.name;
    });

    if (!expectedVariable) {
      return false;
    }

    if (
      isDefined(expectedVariable.info) &&
      expectedVariable.info !== variable.info
    ) {
      return false;
    }

    if (
      isDefined(expectedVariable.detail) &&
      expectedVariable.detail !== variable.detail
    ) {
      return false;
    }

    return true;
  });
});

function isDefined(any) {
  return typeof any !== 'undefined';
}