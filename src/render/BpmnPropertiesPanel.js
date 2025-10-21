import { FeelLanguageContext, PropertiesPanel } from '@bpmn-io/properties-panel';

import {
  BpmnPropertiesPanelContext
} from '../context';

import { PanelHeaderProvider } from './PanelHeaderProvider';
import { PanelPlaceholderProvider } from './PanelPlaceholderProvider';

const DEFAULT_FEEL_LANGUAGE_CONTEXT = {
  parserDialect: 'camunda'
};

/**
 * @param {Object} props
 * @param {djs.model.Base|Array<djs.model.Base>} [props.element]
 * @param {Injector} props.injector
 * @param {Object} props.layoutConfig
 * @param {Object} props.descriptionConfig
 * @param {Object} props.tooltipConfig
 * @param {HTMLElement} props.feelPopupContainer
 * @param {Function} props.getFeelPopupLinks
 */
export default function BpmnPropertiesPanel(props) {
  const {
    element,
    groups,
    injector,
    layoutConfig,
    descriptionConfig,
    tooltipConfig,
    feelPopupContainer,
    getFeelPopupLinks
  } = props;

  const eventBus = injector.get('eventBus');
  const translate = injector.get('translate');

  const selectedElement = element;

  const bpmnPropertiesPanelContext = {
    selectedElement,
    injector,
    getService(type, strict) { return injector.get(type, strict); }
  };

  const onLayoutChanged = (layoutConfig) => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout: layoutConfig
    });
  };

  const onDescriptionLoaded = (description) => {
    eventBus.fire('propertiesPanel.descriptionLoaded', {
      description
    });
  };

  const onTooltipLoaded = (tooltip) => {
    eventBus.fire('propertiesPanel.tooltipLoaded', {
      tooltip
    });
  };

  return (
    <BpmnPropertiesPanelContext.Provider value={ bpmnPropertiesPanelContext }>
      <FeelLanguageContext.Provider value={ DEFAULT_FEEL_LANGUAGE_CONTEXT }>
        <PropertiesPanel
          element={ selectedElement }
          headerProvider={ PanelHeaderProvider(translate) }
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
      </FeelLanguageContext.Provider>
    </BpmnPropertiesPanelContext.Provider>
  );
}
