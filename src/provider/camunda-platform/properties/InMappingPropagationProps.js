import Checkbox, { isEdited as checkboxIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Checkbox';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

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
  getSignalEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';


/**
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#passing-variables
 */
export function InMappingPropagationProps(props) {
  const {
    element
  } = props;

  if (!areInMappingsSupported(element)) {
    return [];
  }

  const entries = [
    {
      id: 'inMapping-propagation',
      component: <PropagateAll element={ element } />,
      isEdited: checkboxIsEdited
    }
  ];

  if (isPropagateAll(element)) {
    entries.push({
      id: 'inMapping-propagation-local',
      component: <Local element={ element } />,
      isEdited: checkboxIsEdited
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
      addInMapping();
    } else {
      removeInMapping();
    }
  };

  function addInMapping() {
    const commands = [];

    const businessObject = getSignalEventDefinition(element) || getBusinessObject(element);

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

    // (2) Add camunda:In mapping
    const mapping = createElement(
      'camunda:In',
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

  function removeInMapping() {
    const businessObject = getSignalEventDefinition(element) || getBusinessObject(element);
    const mappings = findRelevantInMappings(element);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element,
      currentObject: businessObject.get('extensionElements'),
      referencePropertyName: 'extensionElements',
      propertyName: 'values',
      objectsToRemove: mappings
    });
  }

  return Checkbox({
    id: 'inMapping-propagation',
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

  const mapping = findRelevantInMappings(element)[0];

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

  return Checkbox({
    element,
    id: 'inMapping-propagation-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}


// helper //////////////////////////

function areInMappingsSupported(element) {
  const signalEventDefinition = getSignalEventDefinition(element);

  if (signalEventDefinition) {
    return isAny(element, [
      'bpmn:IntermediateThrowEvent',
      'bpmn:EndEvent'
    ]);
  }

  return is(element, 'bpmn:CallActivity');
}

function getInMappings(element) {
  const businessObject = getBusinessObject(element);
  const signalEventDefinition = getSignalEventDefinition(businessObject);
  return getExtensionElementsList(signalEventDefinition || businessObject, 'camunda:In');
}

function findRelevantInMappings(element) {
  const inMappings = getInMappings(element);
  return filter(inMappings, function(mapping) {
    const variables = mapping.get('variables');
    return variables && variables === 'all';
  });
}

function isPropagateAll(element) {
  const mappings = findRelevantInMappings(element);
  return !!mappings.length;
}
