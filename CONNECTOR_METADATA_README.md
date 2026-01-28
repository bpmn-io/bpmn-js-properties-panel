# Connector Metadata Feature - README

This PR adds a **Connector Metadata** feature to the BPMN Properties Panel that allows fetching configuration options from REST APIs instead of requiring users to know them upfront.

---

## 🚀 **TRY THE DEMO NOW!**

```bash
npm install
npm run build
npm run demo
```

Then open **http://localhost:8080/demo/standalone.html**

**📖 Need help?** See [DEMO_GUIDE.md](DEMO_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

### Getting Started
- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - **START HERE!** Complete demo instructions with troubleshooting
- **[demo/QUICKSTART.md](demo/QUICKSTART.md)** - Quick reference (2 minutes)
- **[demo/VISUAL_GUIDE.md](demo/VISUAL_GUIDE.md)** - Visual walkthrough with ASCII diagrams

### Technical Details
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Complete technical documentation
- **[demo/WORKFLOW.md](demo/WORKFLOW.md)** - Architecture and flow diagrams
- **[demo/README.md](demo/README.md)** - Usage and integration guide

---

## ✨ What It Does

Adds a **"Connect" button** to the properties panel that:

1. ✅ Appears for elements with templates (e.g., Slack Connector)
2. ✅ Fetches metadata from REST APIs (currently mocked)
3. ✅ Shows loading, success, and error states
4. ✅ Caches metadata for use in dropdown fields
5. ✅ Fires EventBus events for integration
6. ✅ **Gracefully handles API failures with fallback data** (never crashes!)

---

## 🛡️ Error Handling

The service is designed to **never crash** the application. If the API endpoint is unavailable:

- ✅ Returns sample Slack channels (#general, #engineering, etc.)
- ✅ Logs warnings to console for debugging
- ✅ Fires error events for monitoring
- ✅ Continues normal operation with fallback data

**See:** [ERROR_HANDLING.md](src/provider/connector-metadata/ERROR_HANDLING.md) for details

---

## 🎯 Quick Integration

```javascript
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ConnectorMetadataModule  // New!
} from 'bpmn-js-properties-panel';

const modeler = new BpmnModeler({
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ConnectorMetadataModule  // Add this line
  ]
});

// React to fetched metadata
modeler.get('eventBus').on('connectorMetadata.fetched', (event) => {
  console.log('Channels:', event.metadata.channels);
});
```

---

## 📁 Project Structure

```
src/provider/connector-metadata/
├── ConnectorMetadataService.js          # Core service (API calls, caching)
├── ConnectorMetadataPropertiesProvider.js  # UI component (button, states)
├── connector-metadata.css                # Styling
└── index.js                              # Module export

demo/
├── QUICKSTART.md                         # Quick start guide
├── VISUAL_GUIDE.md                       # Visual walkthrough
├── README.md                             # Architecture & usage
├── WORKFLOW.md                           # Flow diagrams
├── server.js                             # Simple HTTP server
├── standalone.html                       # Demo page
└── diagram.bpmn                          # Sample diagram

test/spec/provider/connector-metadata/
├── ConnectorMetadataPropertiesProvider.spec.js  # Tests
└── ConnectorMetadata.bpmn                       # Test diagram
```

---

## 🔌 Features

### For Users
- 🔘 Click "Connect" button to fetch options
- ⏳ Visual loading feedback
- ✅ Success confirmation
- ❌ Clear error messages

### For Developers
- 📦 Simple module import
- 🎣 EventBus integration
- 💾 Automatic caching
- 🚫 Duplicate request prevention
- 🧹 Memory leak prevention

### For Production
- 🔐 Easy to add authentication
- 🔄 Ready for real API integration
- ⚡ Mock implementation included
- 📝 Comprehensive documentation

---

## 🧪 Testing

```bash
# Run connector metadata tests
npm test -- --grep "ConnectorMetadataPropertiesProvider"

# Run full test suite
npm test
```

---

## 🎬 Demo Flow

1. **Select Service Task** → "Connector Actions" group appears
2. **Click "Connect"** → Button shows "Connecting..."
3. **Wait ~800ms** → Success message appears (green)
4. **Check console** → See fetched Slack channels
5. **Metadata cached** → Ready for dropdown fields

---

## 🔧 Replace Mock API

In `ConnectorMetadataService.js`, replace `_mockFetchFromApi`:

```javascript
async _mockFetchFromApi(templateId, element) {
  const response = await fetch(
    `https://api.example.com/connectors/${templateId}/metadata`,
    { headers: { 'Authorization': 'Bearer YOUR_TOKEN' } }
  );
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

---

## 📊 Mock Data

The demo returns:

**Slack Channels:**
- #general
- #engineering  
- #product
- #marketing
- #sales

**Slack Users:**
- @john.doe
- @jane.smith
- @bot

---

## ✅ Quality Checks

- ✅ Linting passes (ESLint)
- ✅ Build succeeds (Rollup)
- ✅ Tests created (Karma/Mocha)
- ✅ Memory leak prevention
- ✅ Error handling
- ✅ Concurrent request deduplication
- ✅ React hooks compliance
- ✅ No breaking changes

---

## 🎯 Next Steps

1. **Try the demo** - See it in action
2. **Read IMPLEMENTATION.md** - Understand the architecture
3. **Integrate into your app** - Add the module
4. **Connect real API** - Replace mock implementation
5. **Create enhanced fields** - Use fetched metadata in dropdowns

---

## 📞 Support

- **Issues?** See [DEMO_GUIDE.md](DEMO_GUIDE.md) troubleshooting section
- **Questions?** Check [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details
- **Integration help?** See [demo/README.md](demo/README.md) usage guide

---

**Ready to see it in action?**

```bash
npm install && npm run build && npm run demo
```

🎉 **Happy demoing!**
