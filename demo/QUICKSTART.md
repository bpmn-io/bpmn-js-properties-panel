# 🚀 QUICKSTART - Running the Demo

This guide will help you run the Connector Metadata demo in **under 2 minutes**.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Running the Demo

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Library

```bash
npm run build
```

### Step 3: Start the Demo Server

```bash
npm run demo
```

This will:
1. Start a local HTTP server
2. Open the demo page showing the BPMN modeler with properties panel
3. Display instructions in the browser

### Step 4: Try It Out!

Once the demo loads:

1. **Click on the Service Task** labeled "Send Slack Message" in the diagram
2. **Look at the Properties Panel** on the right side
3. **Find the "Connector Actions" group** at the top of the properties panel
4. **Click the "Connect" button**
5. **Watch the button change** to "Connecting..." then show success
6. **Check the browser console** to see the fetched Slack channels

## What You'll See

- ✅ A BPMN diagram with a Service Task
- ✅ Properties Panel on the right
- ✅ "Connector Actions" group at the top (when Service Task is selected)
- ✅ Blue "Connect" button
- ✅ Loading state while fetching
- ✅ Success message with green background
- ✅ Console logs showing fetched metadata

## Troubleshooting

### Port Already in Use

If you see "Error: Address already in use", a server is already running on port 8080. Either:

```bash
# Kill the existing server
lsof -ti:8080 | xargs kill -9

# Or run on a different port
PORT=8081 npm run demo
```

### Build Errors

If the build fails:

```bash
# Clean and rebuild
npm run clean
npm run build
```

### Browser Not Opening

Manually open: `http://localhost:8080/demo/standalone.html`

## Alternative: Use Karma Dev Server

For development/testing, you can also use:

```bash
npm start
```

Then open `http://localhost:9876/debug.html` in your browser.

## What's Being Demonstrated

This demo shows:

1. **Dynamic Metadata Fetching** - Clicking "Connect" simulates a REST API call
2. **Mock Slack API** - Returns 5 channels and 3 users after 800ms
3. **State Management** - Loading, success, and error states
4. **Event-Driven Architecture** - EventBus fires events for integration
5. **Template Integration** - Only shows for elements with templates

## Next Steps

See [demo/README.md](README.md) for:
- Architecture details
- Integration instructions
- Production considerations
- API integration guide
