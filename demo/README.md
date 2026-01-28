# Connector Metadata Demo

This demo showcases the new **Connector Metadata** feature for the BPMN Properties Panel.

## 🚀 Quick Start

```bash
npm install
npm run build
npm run demo
```

Then open **http://localhost:8080/demo/standalone.html** in your browser.

📖 **For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)**

## What it does

The Connector Metadata feature adds a **"Connect" button** to the properties panel that:
1. Appears at the top of the properties panel for elements with templates
2. Fetches metadata from a REST API (mocked for this demo)
3. Caches the metadata for use in dropdown/typeahead fields
4. Shows loading and success states

## Demo Instructions

Once the demo loads:

1. **Click on the Service Task** labeled "Send Slack Message"
2. **Look at the Properties Panel** on the right
3. **Find "Connector Actions"** group at the top
4. **Click the "Connect" button**
5. **Watch the loading state** and success message
6. **Check browser console** to see fetched Slack channels

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide (start here!)
- **[WORKFLOW.md](WORKFLOW.md)** - Visual workflow and architecture
- **[../IMPLEMENTATION.md](../IMPLEMENTATION.md)** - Complete technical details

## Architecture

### Components Created

1. **ConnectorMetadataService** (`src/provider/connector-metadata/ConnectorMetadataService.js`)
   - Service for fetching and caching connector metadata
   - Mock implementation simulates REST API calls
   - Fires events for loading/success/error states

2. **ConnectorMetadataPropertiesProvider** (`src/provider/connector-metadata/ConnectorMetadataPropertiesProvider.js`)
   - Properties provider that adds the Connect button
   - Only shows for elements with templates
   - Integrates with the element templates service

3. **ConnectorMetadataModule** (`src/provider/connector-metadata/index.js`)
   - Exports both the service and provider
   - Can be added to any bpmn-js modeler

### Usage in Your Application

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ConnectorMetadataModule  // <- New module
} from 'bpmn-js-properties-panel';

const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ConnectorMetadataModule  // <- Add this module
  ]
});

// Listen to metadata events
const eventBus = modeler.get('eventBus');
eventBus.on('connectorMetadata.fetched', (event) => {
  console.log('Metadata:', event.metadata);
});
```

### Mock REST API

The mock API currently returns:
- **Slack channels**: 5 predefined channels (#general, #engineering, #product, #marketing, #sales)
- **Slack users**: 3 predefined users (@john.doe, @jane.smith, @bot)

To integrate with a real REST API, modify the `_mockFetchFromApi` method in `ConnectorMetadataService.js`:

```javascript
async _mockFetchFromApi(templateId, element) {
  // Replace with actual HTTP call
  const response = await fetch(`https://your-api.com/connectors/${templateId}/metadata`);
  return await response.json();
}
```

## Next Steps

To complete the prototype, you could:

1. **Add dynamic dropdown population**: Create an enhanced SelectEntry that uses fetched metadata
2. **Add field-level integration**: Allow specific template properties to specify which metadata to use
3. **Add authentication**: Support OAuth or API key authentication for real APIs
4. **Add error handling UI**: Show error messages in the panel when API calls fail
5. **Add refresh capability**: Add a "Refresh" button to update metadata
6. **Add metadata expiration**: Cache metadata for a limited time and auto-refresh

## Testing

A basic test suite is included at `test/spec/provider/connector-metadata/ConnectorMetadataPropertiesProvider.spec.js`.

Run tests with:
```bash
npm test -- --grep "ConnectorMetadataPropertiesProvider"
```

Note: Tests may fail in environments without Chrome/Chromium available.
