import {
  useState,
  useMemo,
  useEffect
} from '@bpmn-io/properties-panel/preact/hooks';

import { computed, signal, useComputed } from '@bpmn-io/properties-panel/@preact/signals';

import {
  find,
  isArray,
  reduce
} from 'min-dash';

import { PropertiesPanel } from '@bpmn-io/properties-panel';

import {
  BpmnPropertiesPanelContext
} from '../context';

import { PanelHeaderProvider } from './PanelHeaderProvider';
import { PanelPlaceholderProvider } from './PanelPlaceholderProvider';

/**
 * @param {Object} props
 * @param {djs.model.Base|Array<djs.model.Base>} [props.element]
 * @param {Injector} props.injector
 * @param { (djs.model.Base) => Array<PropertiesProvider> } props.getProviders
 * @param {Object} props.layoutConfig
 * @param {Object} props.descriptionConfig
 */
export default function BpmnPropertiesPanel(props) {
  const {
    element,
    injector,
    getProviders,
    layoutConfig,
    descriptionConfig
  } = props;

  const canvas = injector.get('canvas');
  const elementRegistry = injector.get('elementRegistry');
  const eventBus = injector.get('eventBus');

  const selectedElement = signal(element);

  /**
   * @param {djs.model.Base | Array<djs.model.Base>} element
   */
  const _update = (element) => {

    if (!element) {
      return;
    }

    let newSelectedElement = element;

    // handle labels
    if (newSelectedElement && newSelectedElement.type === 'label') {
      newSelectedElement = newSelectedElement.labelTarget;
    }

    selectedElement.value = newSelectedElement;

    // notify interested parties on property panel updates
    eventBus.fire('propertiesPanel.updated', {
      element: newSelectedElement
    });
  };

  // (2) react on element changes

  // (2a) selection changed
  useEffect(() => {
    const onSelectionChanged = (e) => {
      const { newSelection = [] } = e;

      if (newSelection.length > 1) {
        return _update(newSelection);
      }

      const newElement = newSelection[0];

      const rootElement = canvas.getRootElement();

      if (isImplicitRoot(rootElement)) {
        return;
      }

      _update(newElement || rootElement);
    };

    eventBus.on('selection.changed', onSelectionChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
    };
  }, []);

  // (2b) selected element changed
  useEffect(() => {
    const onElementsChanged = (e) => {
      const elements = e.elements;

      const updatedElement = findElement(elements, selectedElement.value);

      if (updatedElement && elementExists(updatedElement, elementRegistry)) {
        _update(updatedElement);
      }
    };

    eventBus.on('elements.changed', onElementsChanged);

    return () => {
      eventBus.off('elements.changed', onElementsChanged);
    };
  }, []);

  // (2c) root element changed
  useEffect(() => {
    const onRootAdded = (e) => {
      const element = e.element;

      _update(element);
    };

    eventBus.on('root.added', onRootAdded);

    return () => {
      eventBus.off('root.added', onRootAdded);
    };
  }, []);

  // (2d) provided entries changed
  useEffect(() => {
    const onProvidersChanged = () => {
      _update(selectedElement);
    };

    eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);

    return () => {
      eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
    };
  }, []);

  // (2e) element templates changed
  useEffect(() => {
    const onTemplatesChanged = () => {
      _update(selectedElement);
    };

    eventBus.on('elementTemplates.changed', onTemplatesChanged);

    return () => {
      eventBus.off('elementTemplates.changed', onTemplatesChanged);
    };
  }, []);

  // (3) create properties panel context
  const bpmnPropertiesPanelContext = {
    selectedElement,
    injector,
    getService(type, strict) { return injector.get(type, strict); }
  };

  // (4) retrieve groups for selected element
  const providers = useComputed(() => {
    return getProviders(selectedElement.value);
  });

  const groups = computed(() => {
    return reduce(providers.value, function(groups, provider) {

      // do not collect groups for multi element state
      if (isArray(selectedElement.value)) {
        return [];
      }

      const updater = provider.getGroups(selectedElement);

      return updater(groups);
    }, []);
  });

  // (5) notify layout changes
  const onLayoutChanged = (layout) => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout
    });
  };

  // (6) notify description changes
  const onDescriptionLoaded = (description) => {
    eventBus.fire('propertiesPanel.descriptionLoaded', {
      description
    });
  };

  return <BpmnPropertiesPanelContext.Provider value={ bpmnPropertiesPanelContext }>
    <PropertiesPanel
      element={ selectedElement }
      headerProvider={ PanelHeaderProvider }
      placeholderProvider={ PanelPlaceholderProvider }
      groups={ groups }
      layoutConfig={ layoutConfig }
      layoutChanged={ onLayoutChanged }
      descriptionConfig={ descriptionConfig }
      descriptionLoaded={ onDescriptionLoaded }
      eventBus={ eventBus } />
  </BpmnPropertiesPanelContext.Provider>;
}


// helpers //////////////////////////

function isImplicitRoot(element) {

  // Backwards compatibility for diagram-js<7.4.0, see https://github.com/bpmn-io/bpmn-properties-panel/pull/102
  return element && (element.isImplicit || element.id === '__implicitroot');
}

function findElement(elements, element) {
  return find(elements, (e) => e === element);
}

function elementExists(element, elementRegistry) {
  return element && elementRegistry.get(element.id);
}
