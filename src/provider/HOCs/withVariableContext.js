import { getVariablesForElement } from '@bpmn-io/extract-process-variables/zeebe';
import { useContext, useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { BpmnPropertiesPanelContext } from '../../context';
import { getExtensionElementsList } from '../../utils/ExtensionElementsUtil';
import { getVariablesFromString, handleContextEntry } from './getStaticVariableContext';

// import { useStaticVariableContext } from './getStaticVariableContext';
// import staticContextExtractor from './staticContextExtractor';

export function withVariableContext(Component) {
  return props => {
    const {
      getService
    } = useContext(BpmnPropertiesPanelContext);

    const eventBus = getService('eventBus');

    const { bpmnElement, element } = props;

    const bo = (bpmnElement || element).businessObject;

    // const staticVars = useStaticVariableContext(bo);
    const ebContext = { element: bo, extractors: [] };
    eventBus.fire('getExtractors', ebContext);

    const context = useMemo(() => {
      const variables = getVariablesForElement(bo, ebContext.extractors);
      populateVariables(variables);

      resolveVariableReferences(variables);

      return variables.map(variable => {
        return {
          name: variable.name,
          info: variable.details?.info || 'Written in ' + variable.origin.map(origin => origin.name || origin.id).join(', '),
          values: variable.details?.values,
          detail: variable.details?.detail
        };
      });
    }, [ bo ]);

    // const allVariables = useMemo(() => [ ...staticVars, ...context ], [ staticVars, context ]);

    return <Component { ...props } variables={ context }></Component>;
  };
}


function populateVariables(vars) {
  vars.forEach(variable => {
    console.log(variable);
    const ioMapping = getExtensionElementsList(variable.origin[0], 'zeebe:IoMapping')?.[0];

    if (!ioMapping) {
      return;
    }

    let mappings;
    if (variable.origin[0] === variable.scope) {
      mappings = ioMapping.inputParameters;
    } else {
      mappings = ioMapping.outputParameters;
    }

    if (!mappings) {
      return;
    }

    const origin = mappings.find(mapping => mapping.target === variable.name);

    if (!origin) {
      return;
    }

    const expression = `{ ${variable.name}: ${origin?.source?.substring(1)} }`;

    const context = getVariablesFromString(expression);

    variable.details = context[0];
  });
}

function resolveVariableReferences(variables) {

  // Fix basic unresolved variable types
  const missingVariables = variables.filter(variable => variable.details?.detail === 'variable');
  const pathExpression = variables.filter(variable => variable.details?.detail === 'PathExpression');

  missingVariables.forEach(variable => {
    const expression = variable.details.value;

    const resolved = variables.find(v => v.name === expression);



    if (resolved) {
      variable.details = resolved.details;
    }
  });

  function resolvePathExpression(pathExpr) {
    let context = pathExpr.children[0];
    const key = pathExpr.children[1];

    if (context && context.name === 'VariableName') {
      const res = variables.find(v => v.name === sanitizeKey(context.content));
      if (res) {
        context = res.details.entry;
      }
    }

    if (context && context.name === 'PathExpression') {
      context = resolvePathExpression(context);
    }

    if (!context) {
      return null;
    }

    console.log('context, key', context, key);
    return context.children.find(contEntry => {
      return sanitizeKey(contEntry.children[0].content) === sanitizeKey(key.content);
    });
  }

  pathExpression.forEach(pathExpr => {
    const res = resolvePathExpression(pathExpr.details.entry);
    console.log('result', res);

    if (res?.name === 'ContextEntry') {
      pathExpr.details = handleContextEntry(res);
    }
  });
}

function sanitizeKey(key) {
  if (key.startsWith('"')) {
    key = key.substring(1, key.length - 1);
  }

  return key;
}