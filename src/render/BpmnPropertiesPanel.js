import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect
} from '@bpmn-io/properties-panel/preact/hooks';

import {
  createElement
} from '@bpmn-io/properties-panel/preact';

import {
  find,
  isArray,
  reduce,
  get,
  set,
  assign
} from 'min-dash';

import {
  LayoutContext,
  DescriptionContext,
  TooltipContext,
  ErrorsContext,
  EventContext,
  Placeholder,
  useEvent,
  Group as DefaultGroup
} from '@bpmn-io/properties-panel';

import {
  BpmnPropertiesPanelContext
} from '../context';

import { PanelHeaderProvider } from './PanelHeaderProvider';
import { PanelPlaceholderProvider } from './PanelPlaceholderProvider';
import CustomHeader from './CustomHeader';
import CustomGroup from './CustomGroup';

const DEFAULT_LAYOUT = {};
const DEFAULT_DESCRIPTION = {};
const DEFAULT_TOOLTIP = {};

/**
 * @param {Object} props
 * @param {djs.model.Base|Array<djs.model.Base>} [props.element]
 * @param {Injector} props.injector
 * @param { (djs.model.Base) => Array<PropertiesProvider> } props.getProviders
 * @param {Object} props.layoutConfig
 * @param {Object} props.descriptionConfig
 * @param {Object} props.tooltipConfig
 */
export default function BpmnPropertiesPanel(props) {
  const {
    element,
    injector,
    getProviders,
    layoutConfig: initialLayoutConfig,
    descriptionConfig,
    tooltipConfig,
    feelPopupContainer
  } = props;

  const canvas = injector.get('canvas');
  const elementRegistry = injector.get('elementRegistry');
  const eventBus = injector.get('eventBus');
  const translate = injector.get('translate');

  const [ state, setState ] = useState({
    selectedElement: element
  });

  const selectedElement = state.selectedElement;

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

    setState({
      ...state,
      selectedElement: newSelectedElement
    });

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

      const updatedElement = findElement(elements, selectedElement);

      if (updatedElement && elementExists(updatedElement, elementRegistry)) {
        _update(updatedElement);
      }
    };

    eventBus.on('elements.changed', onElementsChanged);

    return () => {
      eventBus.off('elements.changed', onElementsChanged);
    };
  }, [ selectedElement ]);

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
  }, [ selectedElement ]);

  // (2d) provided entries changed
  useEffect(() => {
    const onProvidersChanged = () => {
      _update(selectedElement);
    };

    eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);

    return () => {
      eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
    };
  }, [ selectedElement ]);

  // (2e) element templates changed
  useEffect(() => {
    const onTemplatesChanged = () => {
      _update(selectedElement);
    };

    eventBus.on('elementTemplates.changed', onTemplatesChanged);

    return () => {
      eventBus.off('elementTemplates.changed', onTemplatesChanged);
    };
  }, [ selectedElement ]);

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
  const [ layoutConfig, setLayoutConfig ] = useState(initialLayoutConfig || {});

  const onLayoutChanged = useCallback((newLayout) => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout: newLayout
    });
  }, [ eventBus ]);

  // React to external layout changes
  useEffect(() => {
    const cb = (e) => {
      const { layout } = e;
      setLayoutConfig(layout);
    };

    eventBus.on('propertiesPanel.setLayout', cb);
    return () => eventBus.off('propertiesPanel.setLayout', cb);
  }, [ eventBus, setLayoutConfig ]);

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

  const placeholderProvider = PanelPlaceholderProvider(translate);

  return (
    <BpmnPropertiesPanelContext.Provider value={ bpmnPropertiesPanelContext }>
      <CustomPropertiesPanel
        element={ selectedElement }
        headerProvider={ PanelHeaderProvider }
        placeholderProvider={ placeholderProvider }
        groups={ groups }
        layoutConfig={ layoutConfig }
        layoutChanged={ onLayoutChanged }
        descriptionConfig={ descriptionConfig }
        descriptionLoaded={ onDescriptionLoaded }
        tooltipConfig={ tooltipConfig }
        tooltipLoaded={ onTooltipLoaded }
        feelPopupContainer={ feelPopupContainer }
        eventBus={ eventBus }
      />
    </BpmnPropertiesPanelContext.Provider>
  );
}


function CustomPropertiesPanel(props) {
  const {
    element,
    headerProvider,
    placeholderProvider,
    groups,
    layoutConfig,
    layoutChanged,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
    eventBus
  } = props;

  // set-up layout context
  const [ layout, setLayout ] = useState(createLayout(layoutConfig));

  useUpdateLayoutEffect(() => {
    const newLayout = createLayout(layoutConfig);
    setLayout(newLayout);
  }, [ layoutConfig ]);

  useEffect(() => {
    if (typeof layoutChanged === 'function') {
      layoutChanged(layout);
    }
  }, [ layout, layoutChanged ]);

  const getLayoutForKey = (key, defaultValue) => {
    return get(layout, key, defaultValue);
  };

  const setLayoutForKey = (key, config) => {
    const newLayout = assign({}, layout);
    set(newLayout, key, config);
    setLayout(newLayout);
  };

  const layoutContext = {
    layout,
    setLayout,
    getLayoutForKey,
    setLayoutForKey
  };

  // set-up description context
  const description = useMemo(() => createDescriptionContext(descriptionConfig), [ descriptionConfig ]);

  useEffect(() => {
    if (typeof descriptionLoaded === 'function') {
      descriptionLoaded(description);
    }
  }, [ description, descriptionLoaded ]);

  const getDescriptionForId = (id, element) => {
    return description[id] && description[id](element);
  };

  const descriptionContext = {
    description,
    getDescriptionForId
  };

  // set-up tooltip context
  const tooltip = useMemo(() => createTooltipContext(tooltipConfig), [ tooltipConfig ]);

  useEffect(() => {
    if (typeof tooltipLoaded === 'function') {
      tooltipLoaded(tooltip);
    }
  }, [ tooltip, tooltipLoaded ]);

  const getTooltipForId = (id, element) => {
    return tooltip[id] && tooltip[id](element);
  };

  const tooltipContext = {
    tooltip,
    getTooltipForId
  };

  const [ errors, setErrors ] = useState({});

  const onSetErrors = ({ errors: newErrors }) => setErrors(newErrors);

  useEvent('propertiesPanel.setErrors', onSetErrors, eventBus);

  const errorsContext = {
    errors
  };

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    element
  };

  // empty state
  if (placeholderProvider && !element) {
    return (
      <Placeholder
        { ...placeholderProvider.getEmpty() }
      />
    );
  }

  // multiple state
  if (placeholderProvider && isArray(element)) {
    return (
      <Placeholder
        { ...placeholderProvider.getMultiple() }
      />
    );
  }

  return (
    <LayoutContext.Provider value={ propertiesPanelContext }>
      <ErrorsContext.Provider value={ errorsContext }>
        <DescriptionContext.Provider value={ descriptionContext }>
          <TooltipContext.Provider value={ tooltipContext }>
            <LayoutContext.Provider value={ layoutContext }>
              <EventContext.Provider value={ eventContext }>
                <div class="bio-properties-panel">
                  <CustomHeader
                    element={ element }
                    headerProvider={ headerProvider }
                    eventBus={ eventBus }
                  />
                  <div class="bio-properties-panel-scroll-container">
                    { groups.map(group => {
                      const {
                        component: Component = CustomGroup,
                        id
                      } = group;

                      const GroupComponent = (Component === DefaultGroup) ? CustomGroup : Component;

                      return createElement(GroupComponent, {
                        ...group,
                        key: id,
                        element: element
                      });
                    }) }
                  </div>
                </div>
              </EventContext.Provider>
            </LayoutContext.Provider>
          </TooltipContext.Provider>
        </DescriptionContext.Provider>
      </ErrorsContext.Provider>
    </LayoutContext.Provider>
  );
}


// helpers //////////////////////////

function isImplicitRoot(element) {
  return element && (element.isImplicit || element.id === '__implicitroot');
}

function findElement(elements, element) {
  return find(elements, (e) => e === element);
}

function elementExists(element, elementRegistry) {
  return element && elementRegistry.get(element.id);
}

function createLayout(overrides = {}, defaults = DEFAULT_LAYOUT) {
  return {
    ...defaults,
    ...overrides
  };
}

function createDescriptionContext(overrides = {}) {
  return {
    ...DEFAULT_DESCRIPTION,
    ...overrides
  };
}

function createTooltipContext(overrides = {}) {
  return {
    ...DEFAULT_TOOLTIP,
    ...overrides
  };
}

function useUpdateLayoutEffect(effect, deps) {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}
