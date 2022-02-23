import { isDefined } from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import { without } from 'min-dash';


const FORM_KEY_PROPS = {
  'camunda:formRef': undefined,
  'camunda:formRefBinding': undefined,
  'camunda:formRefVersion': undefined
};

const FORM_REF_PROPS = {
  'camunda:formKey': undefined
};

export function FormTypeProps(props) {
  return [
    {
      id: 'formType',
      component: FormType,
      isEdited: isSelectEntryEdited
    }
  ];
}

function FormType(props) {
  const { element } = props;

  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const businessObject = getBusinessObject(element);
  const commandStack = useService('commandStack');

  let extensionElements = businessObject.get('extensionElements');

  const getValue = () => {
    if (isDefined(businessObject.get('camunda:formKey'))) {
      return 'formKey';
    } else if (isDefined(businessObject.get('camunda:formRef'))) {
      return 'formRef';
    } else if (getFormData(element)) {
      return 'formData';
    }

    return '';
  };

  const setValue = (value) => {
    const commands = removePropertiesCommands(element, commandStack);

    if (value === 'formData') {

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

      // (2) create camunda:FormData
      const parent = extensionElements;

      const formData = createElement('camunda:FormData', {
        fields: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), formData ]
          }
        }
      });

    } else if (value === 'formKey') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            'camunda:formKey': ''
          }
        }
      });

    } else if (value === 'formRef') {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: {
            'camunda:formRef': ''
          }
        }
      });
    }
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {
    return [
      { value: '', label: translate('<none>') },
      { value: 'formRef', label: translate('Camunda Forms') },
      { value: 'formKey', label: translate('Embedded or External Task Forms') },
      { value: 'formData', label: translate('Generated Task Forms') }
    ];
  };

  return SelectEntry({
    element,
    id: 'formType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function getFormData(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}


function removePropertiesCommands(element, commandStack) {
  const businessObject = getBusinessObject(element);
  const extensionElements = businessObject.get('extensionElements');
  const commands = [];

  // (1) reset formKey and formRef
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: {
        ...FORM_KEY_PROPS,
        ...FORM_REF_PROPS
      }
    }
  });

  // (2) remove formData if defined
  if (extensionElements && getFormData(element)) {
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: without(extensionElements.get('values'), getFormData(element))
        }
      }
    });
  }

  return commands;
}