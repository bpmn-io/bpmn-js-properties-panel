import EmptyIcon from '../icons/bpmn-empty-state.svg';
import MultipleIcon from '../icons/bpmn-multiple-state.svg';


export const PanelPlaceholderProvider = {

  getEmpty: () => {
    return {
      text: 'Select an element to edit its properties.',
      icon: EmptyIcon
    };
  },

  getMultiple: () => {
    return {
      text: 'Multiple elements are selected. Select a single element to edit its properties.',
      icon: MultipleIcon
    };
  }
};