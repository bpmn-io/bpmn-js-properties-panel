import { FeelEntry, FeelTextAreaEntry } from '@bpmn-io/properties-panel';
import { withTooltipContainer, withVariableContext } from '../provider/HOCs';

export const FeelEntryWithContext = withVariableContext(withTooltipContainer(FeelEntry));
export const FeelTextAreaEntryWithContext = withVariableContext(withTooltipContainer(FeelTextAreaEntry));