import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import { createElement } from '../../../utils/ElementUtil';

import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';


export function VersionTagProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:Process') &&
      !(is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }

  return [
    {
      id: 'versionTag',
      component: VersionTag,
      isEdited: isTextFieldEntryEdited
    },
  ];
}

function VersionTag(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    const versionTag = getVersionTag(element);

    if (versionTag) {
      return versionTag.get('value');
    }
  };

  const setValue = (value) => {
    let commands = [];

    const businessObject = getProcess(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
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

    // (2) ensure version tag
    let versionTag = getVersionTag(element);

    if (!versionTag) {
      versionTag = createElement(
        'zeebe:VersionTag',
        {},
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), versionTag ]
          }
        }
      });
    }

    // (3) update version tag value
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: versionTag,
        properties: { value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'versionTag',
    label: translate('Version tag'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////

function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}

function getVersionTag(element) {
  const businessObject = getProcess(element);

  return getExtensionElementsList(businessObject, 'zeebe:VersionTag')[ 0 ];
}