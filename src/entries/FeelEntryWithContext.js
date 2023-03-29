import { FeelEntry as BaseFeelEntry, FeelTextAreaEntry as BaseFeelTextAreaEntry } from '@bpmn-io/properties-panel';
import { withTooltipContainer, withVariableContext } from '../provider/HOCs';

export const FeelEntry = withTooltipContainer(BaseFeelEntry);
export const FeelTextAreaEntry = withTooltipContainer(BaseFeelTextAreaEntry);

export const FeelEntryWithVariableContext = withVariableContext(FeelEntry);
export const FeelTextAreaEntryWithVariableContext = withVariableContext(FeelTextAreaEntry);