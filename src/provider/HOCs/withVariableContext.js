import { getVariablesForElement } from '@bpmn-io/extract-process-variables/zeebe';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from '../../hooks';

export function withVariableContext(Component) {
  return props => {
    const { bpmnElement, element } = props;

    const bo = (bpmnElement || element).businessObject;

    const [ variables, setVariables ] = useState([]);
    const eventBus = useService('eventBus');

    useEffect(() => {
      const callback = () => {
        const variables = getVariablesForElement(bo);

        setVariables(variables.map(variable => {
          return {
            name: variable.name,
            info: 'Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', '),
          };
        }));
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