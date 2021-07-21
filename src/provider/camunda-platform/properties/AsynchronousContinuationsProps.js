import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Checkbox, {
  isEdited as checkboxIsEdited
} from '@bpmn-io/properties-panel/lib/components/entries/Checkbox';

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
        component: <AsynchronousContinuationBefore element={ element } />,
        isEdited: checkboxIsEdited
      },
      {
        id: 'asynchronousContinuationAfter',
        component: <AsynchronousContinuationAfter element={ element } />,
        isEdited: checkboxIsEdited
      }
    );

    if (isAsyncBefore(businessObject) || isAsyncAfter(businessObject)) {
      entries.push(
        {
          id: 'exclusive',
          component: <Exclusive element={ element } />,
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

    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: props
    });

  };

  return Checkbox({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:asyncAfter': value,
      }
    });
  };

  return Checkbox({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:exclusive': value,
      }
    });
  };

  return Checkbox({
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
