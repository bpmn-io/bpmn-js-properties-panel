import { html } from 'htm/preact';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from '../../../hooks';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function(element) {
  if (!isAny(element, [ 'bpmn:Process', 'bpmn:Participant' ])) {
    return [];
  }
  return [
    {
      id: 'newAttribute',
      element,
      component: NewAttribute,
      isEdited: isSelectEntryEdited
    }
  ];
}

function NewAttribute(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.newAttribute || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      newAttribute: value
    });
  };

  const [ attriNames, setAttriNames ] = useState([]);

  useEffect(() => {
    function fetchAttriNames() {
      fetch('/oceans/api/bpm/bpm1001/searchCboxForAttrGrNm',
        {
          'headers': {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7,id;q=0.6,th;q=0.5,ru;q=0.4,ja;q=0.3',
            'content-type': 'application/json; charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest'
          },
          'referrer': '/oceans/BPM_M1001.do',
          'referrerPolicy': 'strict-origin-when-cross-origin',
          'body': '{"header":{"programNr":"BPM_M1001","programAuthNr":"BPM_M1001"},"dataFlowBpmnDto":{"prcsLvl":"Test"}}',
          'method': 'POST',
          'mode': 'cors',
          'credentials': 'include'
        }
      ).then(
        res => res.json()
      ).then(
        resDto => resDto.result.dataFlowBpmnListDto
      ).then(
        attriNames => setAttriNames(attriNames)
      ).catch(error => console.error(error));
    }

    fetchAttriNames();
  }, [ setAttriNames ]);

  const getOptions = () => {
    return [
      {
        label: '--None value--',
        value: undefined
      },
      ...attriNames.map(attri => ({
        label: attri.value01,
        value: attri.value02
      }))
    ];
  };

  return html`<${SelectEntry}
    id=${id}
    element=${element}
    description=${translate('For Attribute Group Name')}
    label=${translate('Attribute Group Name')}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
  />`;
}