import EmptyIcon from '../icons/bpmn-empty-state.svg';
import MultipleIcon from '../icons/bpmn-multiple-state.svg';

export const PanelPlaceholderProvider = (translate) => {
  if (!translate) translate = (text) => text;
  return {
    getEmpty: () => {
      return {
        text: translate('Select an element to edit its properties.'),
        icon: EmptyIcon
      };
    },

    getMultiple: () => {
      return {
        text: translate('Multiple elements are selected. Select a single element to edit its properties.'),
        icon: MultipleIcon
      };
    }
  };
};