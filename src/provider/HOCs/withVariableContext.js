import { getVariablesForElement } from '@bpmn-io/extract-process-variables/zeebe';
import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';

export function withVariableContext(Component) {
  return props => {
    const { bpmnElement, element } = props;

    const bo = (bpmnElement || element).businessObject;

    const context = useMemo(() => {
      const variables = getVariablesForElement(bo);

      return variables.map(variable => {
        return {
          name: variable.name,
          info: 'Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', '),
        };
      });
    }, [ bo ]);

    return <Component { ...props } variables={ context }></Component>;
  };
}