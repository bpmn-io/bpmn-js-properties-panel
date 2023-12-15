import { SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel'
import {
  useService
} from '../../../hooks';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';


export default function RelativeProperty(props) {

  const {
    idPrefix,
    property
  } = props;

  const entries = [ {
    id: idPrefix + '-NextProcess',
    component: NextProcess,
    idPrefix,
    property
  },{
    id: idPrefix + '-PrevProcess',
    component: PrevProcess,
    idPrefix,
    property
  } ];

  return entries;
}

function NextProcess(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        next: value
      }
    });
  };

  const getValue = () => {
    return property.next;
  };

  const [ relates, setRelates ] = useState([]);

  useEffect(() => {
    function fetchSpells() {
      fetch('/oceans/api/bpm/bpm1001/searchCboxForAttrGrId',
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
        relateData => setRelates(relateData)
      ).catch(error => console.error(error));
    }

    fetchSpells();
  }, [ setRelates ]);

  const getOptions = () => {
    return [
      {
        label: '--None value Relate--',
        value: undefined
      },
      ...relates.map(spell => ({
        label: spell.value01,
        value: spell.value02
      }))
    ];
  };

  return SelectEntry({
    element: property,
    id: idPrefix + '-NextProcess',
    label: translate('Next Process ID'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}

function PrevProcess(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        previous:value
      }
    });
  };

  const getValue = () => {
    return property.previous;
  };

  const [ relates, setRelates ] = useState([]);

  useEffect(() => {
    function fetchSpells() {
      fetch('/oceans/api/bpm/bpm1001/searchCboxForAttrGrId',
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
        relateData => setRelates(relateData)
      ).catch(error => console.error(error));
    }

    fetchSpells();
  }, [ setRelates ]);

  const getOptions = () => {
    return [
      {
        label: '--None value Relate--',
        value: undefined
      },
      ...relates.map(spell => ({
        label: spell.value01,
        value: spell.value02
      }))
    ];
  };

  return SelectEntry({
    element: property,
    id: idPrefix + '-PrevProcess',
    label: translate('Previous Process ID'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}