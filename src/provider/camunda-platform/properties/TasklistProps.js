import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { CheckboxEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export function TasklistProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  const isEdited = (node) => {
    return node && !node.checked;
  };

  if (!is(element, 'bpmn:Process') &&
      !(is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }

  return [
    {
      id: 'isStartableInTasklist',
      component: Startable,
      isEdited
    },
  ];
}

function Startable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const process = getProcess(element);

  const getValue = () => {
    return process.get('camunda:isStartableInTasklist');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:isStartableInTasklist': value
      }
    });
  };

  return CheckboxEntry({
    element,
    id: 'isStartableInTasklist',
    label: translate('Startable'),
    getValue,
    setValue
  });
}


// helper //////////////////

function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}
