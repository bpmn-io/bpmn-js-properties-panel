import { html } from 'htm/preact';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from '../../../hooks';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function (element) {

    return [
        {
            id: 'spell',
            element,
            component: Spell,
            isEdited: isSelectEntryEdited
        }
    ];
}

function Spell(props) {
    const { element, id } = props;

    const modeling = useService('modeling');
    const translate = useService('translate');
    const debounce = useService('debounceInput');


    const getValue = () => {
        return element.businessObject.spell || '';
    }

    const setValue = value => {
        return modeling.updateProperties(element, {
            spell: value
        });
    }

    const [spells, setSpells] = useState([]);

    useEffect(() => {
        function fetchSpells() {
            fetch("/oceans/api/bcm/udc3001/udcBiz",
                {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "vi,en-US;q=0.9,en;q=0.8,ko;q=0.7,id;q=0.6,th;q=0.5,ru;q=0.4,ja;q=0.3",
                        "content-type": "application/json; charset=UTF-8",
                        "x-requested-with": "XMLHttpRequest"
                    },
                    "referrer": "/oceans/ADM_M1001.do",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": "{\"header\":{\"programNr\":\"ADM_M1001\",\"programAuthNr\":\"ADM_M1001\"},\"comUDCInDto\":{\"delYn\":\"N\",\"bizType\":\"bizKeyCombo\",\"bizKey\":\"bizPgmSubSysCombo\",\"bizModule\":\"ADM\"}}",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }
            ).then(
                res => res.json()
            ).then(
                resDto => resDto.result.outUdcDtos
            ).then(
                spellbook => setSpells(spellbook)
            ).catch(error => console.error(error));
        }

        fetchSpells();
    }, [setSpells]);

    const getOptions = () => {
        return [
            {
                label: '<none>',
                value: undefined
            },
            ...spells.map(spell => ({
                label: spell.value01,
                value: spell.value02
            }))
        ];
    };

    return html`<${SelectEntry}
    id=${id}
    element=${element}
    description=${translate('Apply a black magic spell')}
    label=${translate('Spell')}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
  />`
}