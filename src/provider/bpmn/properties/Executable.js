import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Checkbox from '@bpmn-io/properties-panel/src/components/entries/Checkbox';

import {
  useService
} from '../../../hooks';


export default function ExecutableProperty(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  let getValue, setValue;

  if (!is(element, 'bpmn:Process') && !hasProcessRef(element)) {
    return;
  }

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