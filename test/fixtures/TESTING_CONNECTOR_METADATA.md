# Testing the Connector Metadata Feature with npm start

This guide explains how to test the connector metadata feature using the integrated demo.

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:9876/debug.html in your browser.

## What You'll See

### 1. BPMN Diagram
- A simple process with a "Send Slack Message" service task
- The service task has the Slack Outbound Connector template applied

### 2. Properties Panel
When you select the service task, you'll see:

**Header:**
- Icon: Slack logo
- Title: "SLACK OUTBOUND CONNECTOR"
- Subtitle: "Send Slack Message"
- Documentation link to Slack connector docs

**Connector Actions Group (at the top):**
- **"Connect" button** - Click to fetch metadata
- Description: "Fetch available options from the connector API"

**Other Groups:**
- General (Name, ID)
- Documentation
- Task definition
- Input mapping
- Output mapping
- Headers
- Execution listeners
- Extension properties

## Testing the Connect Button

1. **Click the "Connect" button**
   - Button text changes to "Connecting..."
   - Button is disabled during fetch

2. **Wait ~800ms** (simulated API call)
   - Success message appears: "Metadata fetched successfully!"
   - Message has green background
   - Message disappears after 3 seconds

3. **Check browser console** (F12)
   - Should see logs:
     ```
     ⏳ Loading metadata for: Slack Connector
     ✅ Metadata fetched: {channels: Array(5), users: Array(3)}
     📊 Available Slack channels: [...]
     ```

## Mock Data Returned

The mock API returns:

**Channels:**
- #general (C123ABC)
- #engineering (C456DEF)
- #product (C789GHI)
- #marketing (C012JKL)
- #sales (C345MNO)

**Users:**
- @john.doe (U123)
- @jane.smith (U456)
- @bot (U789)

## How It Works

### Element Template
The service task has `zeebe:modelerTemplate="io.camunda.connectors.Slack.v1"` attribute, which links it to the Slack connector template defined in `test/fixtures/slack-connector-template.json`.

### ElementTemplates Service
A mock ElementTemplates service is injected that:
1. Reads the `zeebe:modelerTemplate` attribute from elements
2. Returns the matching template from the fixtures
3. Provides template info to the properties panel

### ConnectorMetadataModule
The connector metadata module:
1. Checks if the selected element has a template
2. Shows "Connector Actions" group if template exists
3. Provides the "Connect" button
4. Calls ConnectorMetadataService when clicked
5. Displays loading and success states

### ConnectorMetadataService
The service:
1. Simulates an API call with 800ms delay
2. Returns mock Slack data for slack templates
3. Caches the metadata per template ID
4. Prevents concurrent requests
5. Fires EventBus events for integration

## Differences from Real Implementation

### This Demo:
- ✅ Shows how element templates integrate
- ✅ Demonstrates the Connect button UI
- ✅ Simulates API calls with mock data
- ✅ Shows success/error states
- ❌ Metadata is not used in actual fields (just cached)

### Production Implementation Would:
- Connect to real REST APIs
- Use fetched metadata to populate dropdown fields
- Support authentication (OAuth, API keys)
- Handle errors with retry logic
- Refresh metadata on expiration

## Customizing for Other Connectors

To test with a different connector:

1. **Create a template JSON** in `test/fixtures/`
   - Follow the Camunda element template schema
   - Set unique `id` (e.g., `my-connector-template`)

2. **Create/modify BPMN** in `test/fixtures/`
   - Add service task with `zeebe:modelerTemplate="your-template-id"`

3. **Update test setup** in `BpmnPropertiesPanelRenderer.spec.js`
   - Import your template JSON
   - Pass it to `ElementTemplates` constructor

4. **Adjust mock data** in `ConnectorMetadataService.js`
   - Modify `_mockFetchFromApi()` to return appropriate data for your connector

## Troubleshooting

### Button Not Appearing
- Make sure the service task is selected (blue border)
- Check that task has `zeebe:modelerTemplate` attribute
- Verify template ID matches one in ElementTemplates

### Connect Not Working
- Check browser console for errors
- Verify ConnectorMetadataModule is loaded
- Check that ConnectorMetadataService is injected

### No Success Message
- Wait at least 1 second (800ms + render time)
- Check console for any JavaScript errors
- Try clicking again (should work immediately if cached)

## Files Involved

### Fixtures:
- `test/fixtures/slack-connector-template.json` - Template definition
- `test/fixtures/slack-connector.bpmn` - BPMN with template applied

### Source Code:
- `src/provider/connector-metadata/ConnectorMetadataService.js` - API simulation
- `src/provider/connector-metadata/ConnectorMetadataPropertiesProvider.js` - UI component
- `src/provider/connector-metadata/connector-metadata.css` - Styling
- `src/provider/connector-metadata/index.js` - Module export

### Test Setup:
- `test/spec/BpmnPropertiesPanelRenderer.spec.js` - Demo configuration

## Next Steps

After testing the demo, you can:

1. **Integrate into your app** - Add ConnectorMetadataModule to your modeler
2. **Replace mock API** - Implement real REST calls in ConnectorMetadataService
3. **Create enhanced fields** - Build SelectEntry components that use fetched metadata
4. **Add authentication** - Support OAuth/API keys in the service
5. **Implement refresh** - Add UI to refresh expired metadata

See the main documentation files for integration details:
- [DEMO_GUIDE.md](../DEMO_GUIDE.md)
- [IMPLEMENTATION.md](../IMPLEMENTATION.md)
- [demo/README.md](../demo/README.md)
