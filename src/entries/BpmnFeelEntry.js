import { FeelEntry } from '@bpmn-io/properties-panel';
import { withTooltipContainer, withVariableContext } from '../provider/HOCs';

export const BpmnFeelEntry = withVariableContext(withTooltipContainer(FeelEntry));

