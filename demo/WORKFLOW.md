# Connector Metadata Feature - Visual Workflow

## Overview

This document illustrates how the Connector Metadata feature works in the BPMN Properties Panel.

## User Journey

### Step 1: Select Element with Template
```
User clicks on Service Task "Send Slack Message"
↓
Element has zeebe:modelerTemplate="slack-connector"
↓
Properties Panel displays "Connector Actions" group at top
```

### Step 2: Connect Button Appears
```
┌─────────────────────────────────────┐
│  Connector Actions                  │
│  ┌────────────────┐                 │
│  │   Connect      │  ← Blue button  │
│  └────────────────┘                 │
│  Fetch available options from the   │
│  connector API                      │
└─────────────────────────────────────┘
```

### Step 3: Click Connect Button
```
User clicks "Connect" button
↓
Button changes to "Connecting..."
↓
ConnectorMetadataService.fetchMetadata() called
↓
Mock REST API simulates 800ms delay
```

### Step 4: Loading State
```
┌─────────────────────────────────────┐
│  Connector Actions                  │
│  ┌────────────────┐  ┌────────────┐ │
│  │ Connecting...  │  │ Fetching...│ │
│  └────────────────┘  └────────────┘ │
│  (button disabled)   (gray message) │
└─────────────────────────────────────┘
```

### Step 5: Success State
```
┌─────────────────────────────────────┐
│  Connector Actions                  │
│  ┌────────────────┐  ┌────────────┐ │
│  │   Connect      │  │ Metadata   │ │
│  └────────────────┘  │ fetched    │ │
│  Fetch available     │ success-   │ │
│  options...          │ fully!     │ │
└─────────────────────────────────────┘
          (green background)
```

### Step 6: Metadata Available
```
EventBus fires: 'connectorMetadata.fetched'
↓
Metadata object stored in service cache:
{
  channels: [
    { id: 'C123ABC', name: '#general' },
    { id: 'C456DEF', name: '#engineering' },
    { id: 'C789GHI', name: '#product' },
    { id: 'C012JKL', name: '#marketing' },
    { id: 'C345MNO', name: '#sales' }
  ],
  users: [...]
}
↓
Available for use in dropdown fields (future enhancement)
```

## Architecture Flow

```
┌──────────────────────────────────────────────────────────┐
│                   BPMN Properties Panel                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ConnectorMetadataPropertiesProvider               │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  ConnectButtonEntry (React Component)        │ │ │
│  │  │  - Renders button                            │ │ │
│  │  │  - Handles click events                      │ │ │
│  │  │  - Shows loading/success states              │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ConnectorMetadataService                         │ │
│  │  - fetchMetadata(element, template)               │ │
│  │  - getMetadata(templateId)                        │ │
│  │  - clearMetadata(templateId)                      │ │
│  │  - _mockFetchFromApi() ← Replace with real API   │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  EventBus                                         │ │
│  │  - connectorMetadata.loading                      │ │
│  │  - connectorMetadata.fetched                      │ │
│  │  - connectorMetadata.error                        │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          ↓
                ┌─────────────────┐
                │  REST API       │
                │  (Mocked)       │
                │  Returns JSON   │
                └─────────────────┘
```

## Integration Points

### 1. Element Templates
```javascript
// Service checks if element has template
const template = elementTemplates.get(element);
if (!template) {
  return null; // Don't show button
}
```

### 2. Properties Provider Registration
```javascript
// Registered at priority 500 (before other providers)
propertiesPanel.registerProvider(500, this);
```

### 3. Group Structure
```javascript
{
  id: 'connector-actions',
  label: 'Connector Actions',
  entries: [
    {
      id: 'connector-connect-button',
      component: ConnectButtonEntry
    }
  ]
}
```

## Mock API Response

### For Slack Connector (templateId contains 'slack')
```json
{
  "channels": [
    { "id": "C123ABC", "name": "#general" },
    { "id": "C456DEF", "name": "#engineering" },
    { "id": "C789GHI", "name": "#product" },
    { "id": "C012JKL", "name": "#marketing" },
    { "id": "C345MNO", "name": "#sales" }
  ],
  "users": [
    { "id": "U123", "name": "@john.doe" },
    { "id": "U456", "name": "@jane.smith" },
    { "id": "U789", "name": "@bot" }
  ]
}
```

### For Other Connectors
```json
{
  "options": [
    { "id": "option1", "name": "Option 1" },
    { "id": "option2", "name": "Option 2" },
    { "id": "option3", "name": "Option 3" }
  ]
}
```

## Future Enhancements

### Enhanced Select Entry (Not Yet Implemented)
```javascript
// Proposed API for fields that use fetched metadata
<SelectEntry
  id="slack-channel"
  label="Slack Channel"
  getValue={getValue}
  setValue={setValue}
  useConnectorMetadata={true}
  metadataPath="channels"
  valueField="id"
  labelField="name"
/>
```

This would:
1. Check if metadata is available
2. Populate options from metadata.channels
3. Fall back to manual entry if not available
4. Show "Connect to fetch options" hint

## Testing

### Test Coverage
- ✅ Button renders for elements with templates
- ✅ Button does NOT render for elements without templates  
- ✅ Metadata is fetched when button is clicked
- ✅ Success message appears after fetch
- ✅ Metadata is cached in service

### Manual Testing
1. Start dev server: `npm start`
2. Open debug page in browser
3. Select Service Task with template
4. Click "Connect" button
5. Verify success message appears
6. Check browser console for logged metadata
