# 🎬 Demo Guide - Connector Metadata Feature

This guide shows you how to run and see the **Connector Metadata** feature in action.

## ⚡ Quick Start (3 Commands)

```bash
npm install          # Install dependencies (only needed once)
npm run build        # Build the library
npm run demo         # Start the demo server
```

Then open your browser to: **http://localhost:8080/demo/standalone.html**

---

## 📋 Step-by-Step Instructions

### 1. Install Dependencies

First time only:

```bash
cd /path/to/bpmn-js-properties-panel
npm install
```

This will take a few minutes to download all required packages.

### 2. Build the Library

Every time you pull changes:

```bash
npm run build
```

This compiles the source code and creates the distributable files in the `dist/` folder.

### 3. Run the Demo

Start the demo server:

```bash
npm run demo
```

You should see:

```
🚀 Demo server is running!

📂 Open in browser: http://localhost:8080/demo/standalone.html

Press Ctrl+C to stop the server
```

### 4. Open in Browser

Open **http://localhost:8080/demo/standalone.html** in your browser.

You'll see:
- Instructions at the top of the page
- A BPMN diagram in the center
- A properties panel on the right

### 5. Try the Feature!

**Follow these steps in the browser:**

1. **Click on the Service Task** 
   - It's labeled "Send Slack Message" in the diagram
   
2. **Look at the Properties Panel (right side)**
   - You should see several groups of properties
   
3. **Find "Connector Actions" at the top**
   - This is the new group added by our feature
   
4. **Click the blue "Connect" button**
   - Button text changes to "Connecting..."
   - After ~800ms, you'll see a success message
   
5. **Check the Browser Console (F12)**
   - You'll see logs showing the fetched Slack channels:
   ```
   ⏳ Loading metadata for: Slack Connector
   ✅ Metadata fetched: {channels: Array(5), users: Array(3)}
   📊 Available Slack channels: [...]
   ```

---

## 🎯 What You're Seeing

The demo showcases:

### 1. **Smart Button Display**
The "Connect" button only appears when you select an element that has a template (the Service Task).

### 2. **Dynamic Metadata Fetching**
Clicking "Connect" simulates a REST API call that takes 800ms and returns:
- 5 Slack channels (#general, #engineering, #product, #marketing, #sales)
- 3 Slack users (@john.doe, @jane.smith, @bot)

### 3. **Visual Feedback**
- **Loading state**: "Connecting..." with gray text
- **Success state**: Green background with "Metadata fetched successfully!"
- **Cached**: The metadata is stored and available for dropdown fields

### 4. **Event-Driven Architecture**
The console shows EventBus events being fired:
- `connectorMetadata.loading`
- `connectorMetadata.fetched`

---

## 🔧 Alternative: Karma Dev Server

For development, you can also use the Karma test runner:

```bash
npm start
```

Then open **http://localhost:9876/debug.html** in your browser.

This loads the test environment with the properties panel visible.

---

## 🚫 Troubleshooting

### "Port 8080 already in use"

**Solution 1:** Kill the existing process
```bash
# On Linux/Mac
lsof -ti:8080 | xargs kill -9

# On Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Solution 2:** Use a different port
```bash
PORT=8081 npm run demo
```

### "npm: command not found"

Install Node.js from https://nodejs.org/ (includes npm)

### "Build failed"

Clean and rebuild:
```bash
npm run clean
npm install
npm run build
```

### External resources blocked (standalone demo)

The standalone demo tries to load libraries from CDN, which may be blocked by:
- Corporate firewalls
- Ad blockers
- Privacy extensions

**Solution:** Use the Karma dev server instead:
```bash
npm start
```

---

## 📖 More Information

- **Architecture**: See [IMPLEMENTATION.md](IMPLEMENTATION.md)
- **Workflow**: See [demo/WORKFLOW.md](demo/WORKFLOW.md)
- **Integration**: See [demo/README.md](demo/README.md)

---

## 💡 Next Steps

After seeing the demo, you can:

1. **Integrate into your app** - Add `ConnectorMetadataModule` to your modeler
2. **Replace mock API** - Connect to your real REST endpoint
3. **Use metadata in fields** - Create dropdown fields that use the fetched data

See the documentation files for complete integration instructions!
