import { forEach, isArray } from 'min-dash';
import { getExtensionElementsList } from '../../utils/ExtensionElementsUtil';
import { useStaticVariableContext } from './getStaticVariableContext';

import { createProcessVariable, addVariableToList } from './ProcessVariablesUtil';


/**
 * Retrieves process variables defined in output mappings, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:extensionElements>
 *     <zeebe:ioMapping>
 *       <zeebe:input source="= source" target="variable1" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "variable1" to the list.
 *
 */
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
      console.log('global variable', variable);
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
