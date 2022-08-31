import { getVariablesForElement } from '@bpmn-io/extract-process-variables/zeebe';
import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { useStaticVariableContext } from './getStaticVariableContext';
import staticContextExtractor from './staticContextExtractor';

export function withVariableContext(Component) {
  return props => {
    const { bpmnElement, element } = props;

    const bo = (bpmnElement || element).businessObject;

    // const staticVars = useStaticVariableContext(bo);

    const context = useMemo(() => {
      const variables = getVariablesForElement(bo, [ staticContextExtractor ]);
      console.log(variables);

      // const context = {};

      return variables.map(variable => {
        return {
          name: variable.name,
          info: 'Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', '),
          values: variable.details?.values,
          detail: variable.details?.detail
        };
      });
    }, [ bo ]);

    // const allVariables = useMemo(() => [ ...staticVars, ...context ], [ staticVars, context ]);

    return <Component { ...props } variables={ context }></Component>;
  };
}