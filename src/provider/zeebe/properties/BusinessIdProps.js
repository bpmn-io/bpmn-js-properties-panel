import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited,
  isToggleSwitchEntryEdited,
  ToggleSwitchEntry
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';

import { BpmnFeelEntry } from '../../../entries/BpmnFeelEntry';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getBusinessId,
  getCalledElement,
  hasBusinessId
} from '../utils/CalledElementUtil.js';

/**
 * Business ID configuration for a Call Activity. The child process instance
 * either inherits the parent's Business ID (default) or overrides it with a
 * literal value or FEEL expression.
 */
export function BusinessIdProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:CallActivity')) {
    return [];
  }

  const entries = [
    {
      id: 'businessIdInherit',
      component: InheritBusinessId,
      isEdited: isToggleSwitchEntryEdited
    }
  ];

  if (hasBusinessId(element)) {
    entries.push({
      id: 'businessId',
      component: BusinessId,
      isEdited: isFeelEntryEdited
    });
  }

  return entries;
}

function InheritBusinessId(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate');

  const inherit = !hasBusinessId(element);

  const getValue = () => inherit;

  const setValue = (value) => {

    // (1) inherit -> remove override, otherwise -> add empty override (null Business ID)
    const businessId = value ? undefined : '';

    const commands = [];

    const businessObject = getBusinessObject(element);

    // (2) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (3) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);

    if (!calledElement) {
      calledElement = createElement(
        'zeebe:CalledElement',
        {},
        extensionElements,
        bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), calledElement ]
          }
        }
      });
    }

    // (4) update businessId attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: { businessId }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return ToggleSwitchEntry({
    id,
    label: translate('Inherit from parent'),
    switcherLabel: inherit ? translate('On') : translate('Off'),
    getValue,
    setValue
  });
}

function BusinessId(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => getBusinessId(element);

  const setValue = (value) => {

    // this entry is only rendered once a Business ID override exists (cf.
    // BusinessIdProps), so zeebe:CalledElement is guaranteed to be present
    const calledElement = getCalledElement(getBusinessObject(element));

    // keep empty string as null override, rather than removing it
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: calledElement,
      properties: { businessId: value || '' }
    });
  };

  return BpmnFeelEntry({
    element,
    id,
    label: translate('Business ID'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
