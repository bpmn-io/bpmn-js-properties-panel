import ConnectorMetadataService from './ConnectorMetadataService';
import ConnectorMetadataPropertiesProvider from './ConnectorMetadataPropertiesProvider';

export default {
  __init__: [ 'connectorMetadata', 'connectorMetadataPropertiesProvider' ],
  connectorMetadata: [ 'type', ConnectorMetadataService ],
  connectorMetadataPropertiesProvider: [ 'type', ConnectorMetadataPropertiesProvider ]
};
