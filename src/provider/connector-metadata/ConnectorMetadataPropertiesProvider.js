import { Group } from '@bpmn-io/properties-panel';
import { useService } from '../../hooks';
import { useState } from '@bpmn-io/properties-panel/preact/hooks';

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

  if (!elementTemplates) {
    return null;
  }

  const template = elementTemplates.get(element);

  if (!template) {
    return null;
  }

  const handleConnect = async () => {
    setLoading(true);
    setMessage(translate('Fetching metadata...'));

    try {
      await connectorMetadata.fetchMetadata(element, template);
      setMessage(translate('Metadata fetched successfully!'));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage(translate('Error fetching metadata'));
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
          <div class={ `bio-properties-panel-connect-message ${loading ? 'loading' : 'success'}` }>
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
