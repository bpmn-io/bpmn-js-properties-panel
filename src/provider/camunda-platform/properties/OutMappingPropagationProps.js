import { CheckboxEntry, isCheckboxEntryEdited } from '@bpmn-io/properties-panel';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  filter
} from 'min-dash';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';


/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
export function OutMappingPropagationProps(props) {
  const {
    element
  } = props;

  if (!areOutMappingsSupported(element)) {
    return [];
  }

  const entries = [
    {
      id: 'outMapping-propagation',
      component: <PropagateAll element={ element } />,
      isEdited: isCheckboxEntryEdited
    }
  ];

  if (isPropagateAll(element)) {
    entries.push({
      id: 'outMapping-propagation-local',
      component: <Local element={ element } />,
      isEdited: isCheckboxEntryEdited
    });
  }

  return entries;
}

function PropagateAll(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    return isPropagateAll(element);
  };

  const setValue = value => {
    if (value) {
      addOutMapping();
    } else {
      removeOutMapping();
    }
  };

  function addOutMapping() {
    const commands = [];

    const businessObject = getBusinessObject(element);

    // (1) Ensure extension elements
    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) Add camunda:Out mapping
    const mapping = createElement(
      'camunda:Out',
      {
        variables: 'all'
      },
      parent,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ mapping ]
      }
    });

    // (3) Commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function removeOutMapping() {
    const businessObject = getBusinessObject(element);
    const mappings = findRelevantOutMappings(element);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element,
      currentObject: businessObject.get('extensionElements'),
      referencePropertyName: 'extensionElements',
      propertyName: 'values',
      objectsToRemove: mappings
    });
  }

  return CheckboxEntry({
    id: 'outMapping-propagation',
    label: translate('Propagate all variables'),
    getValue,
    setValue
  });
}

function Local(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const mapping = findRelevantOutMappings(element)[0];

  const getValue = () => {
    return mapping.get('camunda:local');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: mapping,
      properties: {
        'local': value
      }
    });
  };

  return CheckboxEntry({
    element,
    id: 'outMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}


// helper //////////////////////////

function areOutMappingsSupported(element) {
  return is(element, 'bpmn:CallActivity');
}

function getOutMappings(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Out');
}

function findRelevantOutMappings(element) {
  const inMappings = getOutMappings(element);
  return filter(inMappings, function(mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}

function isPropagateAll(element) {
  const mappings = findRelevantOutMappings(element);
  return !!mappings.length;
}
