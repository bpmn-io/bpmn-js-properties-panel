import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isToggleSwitchEntryEdited,
  ToggleSwitchEntry
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';

import { createElement } from '../../../utils/ElementUtil';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';


export function StageProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:SubProcess') || is(element, 'bpmn:Transaction')) {
    return [];
  }

  return [
    {
      id: 'stage',
      component: StageToggle,
      isEdited: isToggleSwitchEntryEdited
    }
  ];
}

function StageToggle(props) {
  const {
    element,
    id
  } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate');

  const getValue = () => !!getStage(element);

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);

    if (value) {
      const stage = createElement('zeebe:Stage', {}, businessObject, bpmnFactory);

      addExtensionElements(element, businessObject, stage, bpmnFactory, commandStack);
    } else {
      removeExtensionElements(element, businessObject, getStage(element), commandStack);
    }
  };

  return ToggleSwitchEntry({
    id,
    label: translate('Mark as stage'),
    switcherLabel: getValue() ? translate('On') : translate('Off'),
    getValue,
    setValue
  });
}


// helper ///////////////////////

function getStage(element) {
  return getExtensionElementsList(getBusinessObject(element), 'zeebe:Stage')[0];
}
