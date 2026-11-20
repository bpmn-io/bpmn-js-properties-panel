import {
  useMemo,
  useCallback
} from '@bpmn-io/properties-panel/preact/hooks';

import {
  isArray,
  reduce
} from 'min-dash';

import { createPortal } from '@bpmn-io/properties-panel/preact/compat';

import { FeelLanguageContext, Header, PropertiesPanel } from '@bpmn-io/properties-panel';

import {
  BpmnPropertiesPanelContext
} from '../context';

import { PanelHeaderProvider } from './PanelHeaderProvider';
import { PanelPlaceholderProvider } from './PanelPlaceholderProvider';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const DEFAULT_FEEL_LANGUAGE_CONTEXT = {
  parserDialect: 'camunda'
};

/**
 * @param {Object} props
 * @param {djs.model.Base|Array<djs.model.Base>} [props.element]
 * @param {Injector} props.injector
 * @param { (djs.model.Base) => Array<PropertiesProvider> } props.getProviders
 * @param {Object} props.layoutConfig
 * @param {Object} props.descriptionConfig
 * @param {Object} props.tooltipConfig
 * @param {HTMLElement} props.feelPopupContainer
 * @param {Function} props.getFeelPopupLinks
 * @param {Object} props.feelLanguageContext
 * @param {HTMLElement} [props.headerParent]
 */
export default function BpmnPropertiesPanel(props) {
  const {
    element: selectedElement,
    injector,
    getProviders,
    layoutConfig,
    descriptionConfig,
    tooltipConfig,
    feelPopupContainer,
    getFeelPopupLinks,
    feelLanguageContext,
    headerParent
  } = props;

  const eventBus = injector.get('eventBus');
  const translate = injector.get('translate');

  // (3) create properties panel context
  const bpmnPropertiesPanelContext = {
    selectedElement,
    injector,
    getService(type, strict) { return injector.get(type, strict); }
  };

  // (4) retrieve groups for selected element
  const providers = getProviders(selectedElement);

  const groups = useMemo(() => {
    return reduce(providers, function(groups, provider) {

      // do not collect groups for multi element state
      if (isArray(selectedElement)) {
        return [];
      }

      const updater = provider.getGroups(selectedElement);

      return updater(groups);
    }, []);
  }, [ providers, selectedElement ]);

  // (5) notify layout changes
  const onLayoutChanged = useCallback((newLayout) => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout: newLayout
    });
  }, [ eventBus ]);

  // (6) notify description changes
  const onDescriptionLoaded = (description) => {
    eventBus.fire('propertiesPanel.descriptionLoaded', {
      description
    });
  };

  // (7) notify tooltip changes
  const onTooltipLoaded = (tooltip) => {
    eventBus.fire('propertiesPanel.tooltipLoaded', {
      tooltip
    });
  };

  // (8) render header separately if a header container is provided
  const separateHeader = !!headerParent;
  const renderSeparateHeader = separateHeader && selectedElement && !isArray(selectedElement);

  const headerProvider = PanelHeaderProvider(translate);
  const mergedFeelLanguageContext = useMemo(() => ({
    ...DEFAULT_FEEL_LANGUAGE_CONTEXT,
    ...feelLanguageContext
  }), [ feelLanguageContext ]);

  return (
    <BpmnPropertiesPanelContext.Provider value={ bpmnPropertiesPanelContext }>
      <FeelLanguageContext.Provider value={ mergedFeelLanguageContext }>
        <PropertiesPanel
          element={ selectedElement }
          headerProvider={ separateHeader ? null : headerProvider }
          placeholderProvider={ PanelPlaceholderProvider(translate) }
          groups={ groups }
          layoutConfig={ layoutConfig }
          layoutChanged={ onLayoutChanged }
          descriptionConfig={ descriptionConfig }
          descriptionLoaded={ onDescriptionLoaded }
          tooltipConfig={ tooltipConfig }
          tooltipLoaded={ onTooltipLoaded }
          feelPopupContainer={ feelPopupContainer }
          getFeelPopupLinks={ getFeelPopupLinks }
          eventBus={ eventBus } />
        {
          renderSeparateHeader
            ? createPortal(
              <Header
                element={ selectedElement }
                headerProvider={ headerProvider } />,
              headerParent
            )
            : null
        }
      </FeelLanguageContext.Provider>
    </BpmnPropertiesPanelContext.Provider>
  );
}
