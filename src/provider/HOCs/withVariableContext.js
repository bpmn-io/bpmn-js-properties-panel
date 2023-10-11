import { getVariablesForElement } from '@bpmn-io/extract-process-variables/zeebe';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from '../../hooks';

const fallbackResolver = {
  getVariablesForElement: bo => getVariablesForElement(bo)
};

export function withVariableContext(Component) {
  return props => {
    const { bpmnElement, element } = props;

    const bo = (bpmnElement || element).businessObject;

    const [ variables, setVariables ] = useState([]);
    const eventBus = useService('eventBus');

    const variableResolver = useServiceIfAvailable('variableResolver', fallbackResolver);

    useEffect(() => {
      const extractVariables = async () => {

        const variables = await variableResolver.getVariablesForElement(bo, element);

        setVariables(variables.map(variable => {
          return {
            ...variable,
            info: variable.info ||
                  (variable.origin && ('Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', ')))
          };
        }));
      };

      // The callback must return undefined, so the event propagation is not canceled.
      // Cf. https://github.com/camunda/camunda-modeler/issues/3392
      const callback = () => {
        extractVariables();
      };

      eventBus.on('commandStack.changed', callback);
      callback();

      return () => {
        eventBus.off('commandStack.changed', callback);
      };
    }, [ bo ]);

    return <Component { ...props } variables={ variables }></Component>;
  };
}

// helpers //////////

function useServiceIfAvailable(service, fallback) {
  const resolved = useService(service, false);

  if (!resolved) {
    return fallback;
  }

  return resolved;
}
