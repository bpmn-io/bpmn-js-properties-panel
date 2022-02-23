import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  CheckboxEntry,
  isCheckboxEntryEdited
} from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export function AsynchronousContinuationsProps(props) {
  const {
    element
  } = props;

  const checkboxIsEditedInverted = (node) => {
    return node && !node.checked;
  };

  const businessObject = getBusinessObject(element);

  const entries = [];

  if (is(element, 'camunda:AsyncCapable')) {
    entries.push(
      {
        id: 'asynchronousContinuationBefore',
        component: AsynchronousContinuationBefore,
        isEdited: isCheckboxEntryEdited
      },
      {
        id: 'asynchronousContinuationAfter',
        component: AsynchronousContinuationAfter,
        isEdited: isCheckboxEntryEdited
      }
    );

    if (isAsyncBefore(businessObject) || isAsyncAfter(businessObject)) {
      entries.push(
        {
          id: 'exclusive',
          component: Exclusive,
          isEdited: checkboxIsEditedInverted
        }
      );
    }
  }

  return entries;
}

function AsynchronousContinuationBefore(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return isAsyncBefore(businessObject);
  };

  const setValue = (value) => {

    // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
    const props = {
      'camunda:asyncBefore': value,
      'camunda:async': undefined
    };

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: props
    });

  };

  return CheckboxEntry({
    element,
    id: 'asynchronousContinuationBefore',
    label: translate('Before'),
    getValue,
    setValue
  });
}

function AsynchronousContinuationAfter(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return isAsyncAfter(businessObject);
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:asyncAfter': value,
      }
    });
  };

  return CheckboxEntry({
    element,
    id: 'asynchronousContinuationAfter',
    label: translate('After'),
    getValue,
    setValue
  });
}

function Exclusive(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return isExclusive(businessObject);
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:exclusive': value,
      }
    });
  };

  return CheckboxEntry({
    element,
    id: 'exclusive',
    label: translate('Exclusive'),
    getValue,
    setValue
  });
}


// helper //////////////////

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
