import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import Checkbox, { isEdited as checkboxIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Checkbox';

import {
  useService
} from '../../../hooks';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';


/**
 * @typedef { import('@bpmn-io/properties-panel/lib/PropertiesPanel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function MultiInstanceProps(props) {
  const {
    element
  } = props;

  const loopCharacteristics = getLoopCharacteristics(element);

  let entries = props.entries || [];

  if (!isMultiInstanceSupported(element)) {
    return entries;
  }

  entries.push(
    {
      id: 'collection',
      component: <Collection element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'elementVariable',
      component: <ElementVariable element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'multiInstanceAsynchronousBefore',
      component: <MultiInstanceAsynchronousBefore element={ element } />,
      isEdited: checkboxIsEdited
    },
    {
      id: 'multiInstanceAsynchronousAfter',
      component: <MultiInstanceAsynchronousAfter element={ element } />,
      isEdited: checkboxIsEdited
    });

  if (isAsync(loopCharacteristics)) {
    entries.push(
      {
        id: 'multiInstanceExclusive',
        component: <MultiInstanceExclusive element={ element } />,
        isEdited: checkboxIsEditedInverted
      },
      {
        id: 'multiInstanceRetryTimeCycle',
        component: <MultiInstanceRetryTimeCycle element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  }

  return entries;
}

function Collection(props) {
  const { element } = props;

  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    return getCollection(element);
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: loopCharacteristics,
        properties: {
          'camunda:collection': value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'collection',
    label: translate('Collection'),
    getValue,
    setValue,
    debounce
  });
}

function ElementVariable(props) {
  const { element } = props;

  const debounce = useService('debounceInput');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    return getElementVariable(element);
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: loopCharacteristics,
        properties: {
          'camunda:elementVariable': value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'elementVariable',
    label: translate('Element variable'),
    getValue,
    setValue,
    debounce
  });
}

function MultiInstanceAsynchronousBefore(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    return isAsyncBefore(loopCharacteristics);
  };

  const setValue = (value) => {

    // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
    const props = {
      'camunda:asyncBefore': value,
      'camunda:async': undefined
    };

    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: loopCharacteristics,
      properties: props
    });
  };

  return Checkbox({
    element,
    id: 'multiInstanceAsynchronousBefore',
    label: translate('Asynchronous before'),
    getValue,
    setValue
  });
}

function MultiInstanceAsynchronousAfter(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    return isAsyncAfter(loopCharacteristics);
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: loopCharacteristics,
      properties: {
        'camunda:asyncAfter': value,
      }
    });
  };

  return Checkbox({
    element,
    id: 'multiInstanceAsynchronousAfter',
    label: translate('Asynchronous after'),
    getValue,
    setValue
  });
}

function MultiInstanceExclusive(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    return isExclusive(loopCharacteristics);
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: loopCharacteristics,
      properties: {
        'camunda:exclusive': value,
      }
    });
  };

  return Checkbox({
    element,
    id: 'multiInstanceExclusive',
    label: translate('Exclusive'),
    getValue,
    setValue
  });
}

function MultiInstanceRetryTimeCycle(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const loopCharacteristics = getLoopCharacteristics(element);

  const getValue = () => {
    const failedJobRetryTimeCycle = getExtensionElementsList(loopCharacteristics,
      'camunda:FailedJobRetryTimeCycle')[0];
    return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body;
  };

  const setValue = (value) => {
    const commands = [];

    let extensionElements = loopCharacteristics.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        loopCharacteristics,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: loopCharacteristics,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure failedJobRetryTimeCycle
    let failedJobRetryTimeCycle = getExtensionElementsList(loopCharacteristics,
      'camunda:FailedJobRetryTimeCycle')[0];

    if (!failedJobRetryTimeCycle) {
      failedJobRetryTimeCycle = createElement(
        'camunda:FailedJobRetryTimeCycle',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: loopCharacteristics,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ failedJobRetryTimeCycle ]
        }
      });
    }

    // (3) update failedJobRetryTimeCycle value
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: failedJobRetryTimeCycle,
        properties: { body: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'multiInstanceRetryTimeCycle',
    label: translate('Retry time cycle'),
    getValue,
    setValue,
    debounce
  });
}


// helper ////////////////////////////

// generic ///////////////////////////

/**
 * isMultiInstanceSupported - check whether given element supports camunda specific props
 * for multiInstance (ref. <camunda:Cllectable>).
 *
 * @param {djs.model.Base} element
 * @return {boolean}
 */
function isMultiInstanceSupported(element) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return !!loopCharacteristics && is(loopCharacteristics, 'camunda:Collectable');
}

/**
 * getProperty - get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  var loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * getLoopCharacteristics - get loopCharacteristics of a given element.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics> | undefined}
 */
function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

// collection

/**
 * getCollection - get the 'camunda:collection' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:collection' value
 */
function getCollection(element) {
  return getProperty(element, 'camunda:collection');
}

// elementVariable

/**
 * getElementVariable - get the 'camunda:elementVariable' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:elementVariable' value
 */
function getElementVariable(element) {
  return getProperty(element, 'camunda:elementVariable');
}

// asyncBefore asyncAfter

/**
 * Returns true if the attribute 'camunda:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

/**
 * Returns true if the attribute 'camunda:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter(bo) {
  return !!bo.get('camunda:asyncAfter');
}

/**
 * Returns true if the attribute 'camunda:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive(bo) {
  return !!bo.get('camunda:exclusive');
}

/**
 * isAsync - returns true if the attribute 'camunda:asyncAfter' or 'camunda:asyncBefore'
 * is set to true.
 *
 * @param  {ModdleElement} bo
 * @return {boolean}
 */
function isAsync(bo) {
  return isAsyncAfter(bo) || isAsyncBefore(bo);
}

// Checkbox

function checkboxIsEditedInverted(node) {
  return node && !node.checked;
}
