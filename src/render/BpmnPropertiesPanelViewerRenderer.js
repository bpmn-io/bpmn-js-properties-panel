import BpmnPropertiesPanelRenderer from './BpmnPropertiesPanelRenderer';

/**
 * A read-only {@link BpmnPropertiesPanelRenderer}, for use in a viewer
 * (e.g. `NavigatedViewer`) that has no means to modify the diagram.
 */
export default class BpmnPropertiesPanelViewerRenderer extends BpmnPropertiesPanelRenderer {

  _isReadOnly() {
    return true;
  }
}

BpmnPropertiesPanelViewerRenderer.$inject = [ 'config.propertiesPanel', 'injector', 'eventBus' ];
