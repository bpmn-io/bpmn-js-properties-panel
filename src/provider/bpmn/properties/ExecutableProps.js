import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Checkbox, { isEdited } from '@bpmn-io/properties-panel/lib/components/entries/Checkbox';

import {
  useService
} from '../../../hooks';

export function ExecutableProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:Process') && !hasProcessRef(element)) {
    return [];
  }

  return [
    {
      id: 'isExecutable',
      component: <Executable element={ element } />,
      isEdited
    }
  ];
}

function Executable(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  let getValue, setValue;

  setValue = (value) => {
    modeling.updateProperties(element, {
      isExecutable: value
    });
  };

  getValue = (element) => {
    return element.businessObject.isExecutable;
  };

  // handle properties on processRef level for participants
  if (is(element, 'bpmn:Participant')) {

    const process = element.businessObject.get('processRef');

    setValue = (value) => {
      commandStack.execute(
        'properties-panel.update-businessobject',
        {
          element,
          businessObject: process,
          properties: {
            isExecutable: value
          }
        }
      );
    };

    getValue = () => {
      return process.get('isExecutable');
    };

  }

  return Checkbox({
    element,
    id: 'isExecutable',
    label: translate('Executable'),
    getValue,
    setValue
  });
}


// helper /////////////////////

function hasProcessRef(element) {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}