# Connector Metadata Service - Error Handling

## Overview

The ConnectorMetadataService is designed to gracefully handle API failures by providing fallback data instead of crashing the application.

## Problem

When the REST API endpoint is unavailable (network issues, DNS failures, authentication problems), the application should continue to function with sample data rather than crash.

## Solution

### Graceful Error Handling

The `fetchMetadata` method catches all errors and returns sample data:

```javascript
try {
  const metadata = await this._mockFetchFromApi(templateId, element);
  // ... success handling
} catch (error) {
  // Log but don't throw
  console.warn(`Failed to fetch metadata for template ${templateId}:`, error.message || error);
  
  // Return fallback data
  const fallbackMetadata = this._getSampleMetadata(templateId);
  this._metadata[templateId] = fallbackMetadata;
  
  // Fire events for monitoring
  this._eventBus.fire('connectorMetadata.error', { element, template, error });
  this._eventBus.fire('connectorMetadata.fetched', {
    element,
    template,
    metadata: fallbackMetadata,
    fallback: true
  });
  
  return fallbackMetadata; // ✅ Never throws
}
```

### Fallback Data

The `_getSampleMetadata(templateId)` method provides consistent sample data:

- **Slack connectors** (`templateId` contains "slack"):
  - 5 sample channels: #general, #engineering, #product, #marketing, #sales
  - 3 sample users: @john.doe, @jane.smith, @bot

- **Other connectors**:
  - 3 generic options

## Benefits

1. **No crashes** - Application continues working
2. **Developer experience** - Can develop without backend setup
3. **Monitoring** - Error events still fired for logging
4. **User experience** - Users can see realistic sample data

## Integration

When replacing `_mockFetchFromApi` with a real API call:

```javascript
async _mockFetchFromApi(templateId, element) {
  const response = await fetch(`https://api.example.com/metadata/${templateId}`, {
    headers: {
      'Authorization': `Bearer ${credentials}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
```

The error handling will automatically catch any failures and return fallback data.

## Events

### Success Flow
1. `connectorMetadata.loading` - Fired when fetch starts
2. `connectorMetadata.fetched` - Fired when data received

### Error Flow (with fallback)
1. `connectorMetadata.loading` - Fired when fetch starts
2. `connectorMetadata.error` - Fired when error occurs
3. `connectorMetadata.fetched` - Fired with `fallback: true` flag

## Testing

See `test/spec/provider/connector-metadata/ConnectorMetadataPropertiesProvider.spec.js`:

- `should return fallback data when API call fails` - Verifies fallback data is returned
- `should not crash the application when API fails` - Verifies no exception is thrown

## Common Errors Handled

- Network failures (DNS, timeout, connection refused)
- HTTP errors (4xx, 5xx)
- Authentication failures
- Malformed responses
- gRPC errors (when integrated with gRPC-based services)

All errors are caught and logged, but never crash the application.
