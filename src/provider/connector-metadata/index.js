import ConnectorMetadataService from './ConnectorMetadataService';
import ConnectorMetadataPropertiesProvider from './ConnectorMetadataPropertiesProvider';
import TemplateFieldEnhancer from './TemplateFieldEnhancer';

export default {
  __init__: [
    'connectorMetadata',
    'connectorMetadataPropertiesProvider',
    'templateFieldEnhancer'
  ],
  connectorMetadata: [ 'type', ConnectorMetadataService ],
  connectorMetadataPropertiesProvider: [ 'type', ConnectorMetadataPropertiesProvider ],
  templateFieldEnhancer: [ 'type', TemplateFieldEnhancer ]
};
