import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../../hooks';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';


/**
 * Defines entries for calling a BPMN diagram.
 * Cf. https://docs.camunda.org/manual/7.15/reference/bpmn20/subprocesses/call-activity/#calledelement-tenant-id
 */
export function CalledBpmnProps(props) {
  const { element } = props;

  const entries = [
    {
      id: 'calledElement',
      component: <CalledElement element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'calledElementBinding',
      component: <CalledElementBinding element={ element } />,
      isEdited: selectIsEdited
    },
    {
      id: 'calledElementTenantId',
      component: <CalledElementTenantId element={ element } />,
      isEdited: textFieldIsEdited
    }
  ];

  const binding = getBusinessObject(element).get('camunda:calledElementBinding');
  if (binding === 'version') {
    entries.splice(-1, 0,
      {
        id: 'calledElementVersion',
        component: <CalledElementVersion element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  } else if (binding === 'versionTag') {
    entries.splice(-1, 0,
      {
        id: 'calledElementVersionTag',
        component: <CalledElementVersionTag element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  }

  return entries;
}

function CalledElement(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('calledElement');
  };

  const setValue = value => {
    modeling.updateProperties(element, { calledElement: value || '' });
  };

  return <TextField
    element={ element }
    id="calledElement"
    label={ translate('Called element') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function CalledElementBinding(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:calledElementBinding') || 'latest';
  };

  const setValue = value => {
    modeling.updateProperties(element,
      {
        calledElementBinding: value === 'latest' ? undefined : value,
        calledElementVersion: undefined,
        calledElementVersionTag: undefined
      }
    );
  };

  const getOptions = () => ([
    { value: 'latest', label: translate('latest') },
    { value: 'deployment', label: translate('deployment') },
    { value: 'version', label: translate('version') },
    { value: 'versionTag', label: translate('version tag') }
  ]);


  return <Select
    element={ element }
    id="calledElementBinding"
    label={ translate('Binding') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

function CalledElementVersion(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:calledElementVersion');
  };

  const setValue = value => {
    modeling.updateProperties(element, { calledElementVersion: value });
  };

  return <TextField
    element={ element }
    id="calledElementVersion"
    label={ translate('Version') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function CalledElementVersionTag(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:calledElementVersionTag');
  };

  const setValue = value => {
    modeling.updateProperties(element, { calledElementVersionTag: value });
  };

  return <TextField
    element={ element }
    id="calledElementVersionTag"
    label={ translate('Version tag') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function CalledElementTenantId(props) {
  const { element } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getBusinessObject(element).get('camunda:calledElementTenantId');
  };

  const setValue = value => {
    modeling.updateProperties(element, { calledElementTenantId: value });
  };

  return <TextField
    element={ element }
    id="calledElementTenantId"
    label={ translate('Tenant ID') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}
