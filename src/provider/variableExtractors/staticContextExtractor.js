import { forEach, isArray } from 'min-dash';
import { getExtensionElementsList } from '../../utils/ExtensionElementsUtil';
import { useStaticVariableContext } from '../HOCs/getStaticVariableContext';

import { createProcessVariable, addVariableToList } from '../HOCs/ProcessVariablesUtil';


export default function(options) {
  var elements = options.elements,
      processVariables = options.processVariables,
      containerElement = options.containerElement;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  // Service Task topic mappings
  forEach(elements, function(element) {
    const context = useStaticVariableContext(element);

    const type = getExtensionElementsList(element, 'zeebe:TaskDefinition')?.[0]?.type;
    if (!type) {
      return;
    }

    context['type:' + type]?.out?.forEach(variable => {
      var newVariable = createProcessVariable(
        element,
        variable.name,
        containerElement,
        variable
      );

      addVariableToList(processVariables, newVariable);

    });
  });

  // ID mappings
  forEach(elements, function(element) {
    const context = useStaticVariableContext(element);

    context['id:' + element.id]?.in?.forEach(variable => {
      var newVariable = createProcessVariable(
        element,
        variable.name,
        element,
        variable
      );

      addVariableToList(processVariables, newVariable);
    });

  });

  return processVariables;
}
