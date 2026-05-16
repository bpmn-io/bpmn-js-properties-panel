import {
  useMemo
} from '@bpmn-io/properties-panel/preact/hooks';

import { Header } from '@bpmn-io/properties-panel';

import {
  BpmnPropertiesPanelContext
} from '../context';

import { PanelHeaderProvider } from './PanelHeaderProvider';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

export default function BpmnPropertiesPanelHeader({ injector, element }) {
  const translate = injector.get('translate');

  const headerProvider = useMemo(() => PanelHeaderProvider(translate), [ translate ]);

  const context = useMemo(() => ({
    selectedElement: element,
    injector,
    getService: (type, strict) => injector.get(type, strict)
  }), [ injector, element ]);

  if (!element || Array.isArray(element)) {
    return null;
  }

  return (
    <BpmnPropertiesPanelContext.Provider value={ context }>
      <Header element={ element } headerProvider={ headerProvider } />
    </BpmnPropertiesPanelContext.Provider>
  );
}
