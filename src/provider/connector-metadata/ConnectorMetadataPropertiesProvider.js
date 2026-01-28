import { Group } from '@bpmn-io/properties-panel';
import { useService } from '../../hooks';
import { useState, useEffect } from '@bpmn-io/properties-panel/preact/hooks';

/**
 * Creates a Connect button entry for fetching connector metadata
 */
function ConnectButtonEntry(props) {
  const {
    element,
    id
  } = props;

  const connectorMetadata = useService('connectorMetadata');
  const elementTemplates = useService('elementTemplates', false);
  const translate = useService('translate');

  const [ loading, setLoading ] = useState(false);
  const [ message, setMessage ] = useState('');
  const [ messageType, setMessageType ] = useState('');

  // Get template (need to do this before early returns to satisfy hooks rules)
  const template = elementTemplates ? elementTemplates.get(element) : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    let timeoutId;

    if (message && messageType === 'success') {
      timeoutId = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [ message, messageType ]);

  // Early returns after all hooks
  if (!elementTemplates) {
    return null;
  }

  if (!template) {
    return null;
  }

  const handleConnect = async () => {

    // Prevent concurrent requests
    if (connectorMetadata.isLoading(template.id)) {
      return;
    }

    setLoading(true);
    setMessage(translate('Fetching metadata...'));
    setMessageType('loading');

    try {
      await connectorMetadata.fetchMetadata(element, template);
      setMessage(translate('Metadata fetched successfully!'));
      setMessageType('success');
    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      setMessage(translate('Error: {errorMsg}', { errorMsg }));
      setMessageType('error');
      console.error('Error fetching connector metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-connect-button-entry" data-entry-id={ id }>
      <div class="bio-properties-panel-connect-button-container">
        <button
          class="bio-properties-panel-connect-button"
          onClick={ handleConnect }
          disabled={ loading }
          type="button"
        >
          { loading ? translate('Connecting...') : translate('Connect') }
        </button>
        { message && (
          <div class={ `bio-properties-panel-connect-message ${messageType}` }>
            { message }
          </div>
        )}
      </div>
      <div class="bio-properties-panel-connect-description">
        { translate('Fetch available options from the connector API') }
      </div>
    </div>
  );
}

/**
 * Creates the Connector Actions group with the Connect button
 */
function ConnectorActionsGroup(element, injector) {
  const translate = injector.get('translate');
  const elementTemplates = injector.get('elementTemplates', false);

  if (!elementTemplates) {
    return null;
  }

  const template = elementTemplates.get(element);

  // Only show for elements with templates
  if (!template) {
    return null;
  }

  const entries = [
    {
      id: 'connector-connect-button',
      component: ConnectButtonEntry,
      element
    }
  ];

  return {
    id: 'connector-actions',
    label: translate('Connector Actions'),
    entries,
    component: Group
  };
}

/**
 * Properties provider that adds connector actions to the properties panel
 */
export default class ConnectorMetadataPropertiesProvider {

  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(500, this);
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {
      const connectorGroup = ConnectorActionsGroup(element, this._injector);

      if (connectorGroup) {

        // Add at the beginning of the groups
        groups.unshift(connectorGroup);
      }

      return groups;
    };
  }
}

ConnectorMetadataPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];
