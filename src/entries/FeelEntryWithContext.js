import { FeelEntry } from '@bpmn-io/properties-panel';
import { withTooltipContainer, withVariableContext, withFeelLanguageContext } from '../provider/HOCs';

export const BpmnFeelEntry = withFeelLanguageContext(withVariableContext(withTooltipContainer(FeelEntry)));

