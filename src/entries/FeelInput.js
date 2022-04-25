import { getCloudVariablesForElement } from '@bpmn-io/extract-process-variables';
import { FeelEntry } from '@bpmn-io/properties-panel';

export default function FeelInput(props) {
  const { bpmnElement, element } = props;

  const variables = getCloudVariablesForElement(bpmnElement || element);

  return FeelEntry({ variables, ...props });
}
