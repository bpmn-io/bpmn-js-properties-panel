# 📸 Demo Visual Guide

This guide shows you **exactly** what you'll see when running the demo.

## Starting the Demo

When you run `npm run demo`, you'll see:

```
🚀 Demo server is running!

📂 Open in browser: http://localhost:8080/demo/standalone.html

Press Ctrl+C to stop the server
```

## Demo Interface Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  BPMN Properties Panel - Connector Metadata Prototype              │
├─────────────────────────────────────────────────────────────────────┤
│  📋 Demo Instructions:                                              │
│  • Click on the Service Task "Send Slack Message" in the diagram   │
│  • The properties panel will show a "Connect" button               │
│  • Click the Connect button to fetch Slack channel metadata        │
│  • Watch as mock Slack channels are loaded                         │
│  • Check the browser console to see the fetched metadata           │
├──────────────────────────────────┬──────────────────────────────────┤
│                                  │                                  │
│    BPMN DIAGRAM (Left Side)     │  PROPERTIES PANEL (Right Side)   │
│                                  │                                  │
│         ┌─────┐                  │  ┌──────────────────────────┐   │
│    ──>  │Start│  ───>            │  │  Connector Actions       │   │
│         └─────┘                  │  │  ┌────────────────────┐  │   │
│                                  │  │  │     Connect        │  │   │
│              ┌─────────────┐     │  │  └────────────────────┘  │   │
│         ──>  │Send Slack   │──>  │  │  Fetch available options│   │
│              │Message      │     │  │  from connector API      │   │
│              └─────────────┘     │  └──────────────────────────┘   │
│                   ↑              │                                  │
│              (Click here!)       │  ┌──────────────────────────┐   │
│                                  │  │  General                 │   │
│                                  │  │  • Name: Send Slack...   │   │
│         ┌─────┐                  │  │  • ID: ServiceTask_1     │   │
│    ──>  │ End │                  │  └──────────────────────────┘   │
│         └─────┘                  │                                  │
│                                  │  ┌──────────────────────────┐   │
│                                  │  │  Documentation           │   │
│                                  │  └──────────────────────────┘   │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

## Step-by-Step: What You'll See

### 1. Initial State (Service Task Not Selected)

**Properties Panel Shows:** General properties for the diagram/process

### 2. After Clicking Service Task

**Properties Panel Shows:**

```
┌───────────────────────────────────┐
│ 🔗 Connector Actions              │  ← NEW GROUP AT TOP!
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │      Connect               │  │  ← BLUE BUTTON
│  └─────────────────────────────┘  │
│  Fetch available options from the │
│  connector API                    │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│ 📋 General                        │
├───────────────────────────────────┤
│ Name: Send Slack Message          │
│ ID: ServiceTask_1                 │
└───────────────────────────────────┘
```

### 3. After Clicking "Connect" - Loading State

```
┌───────────────────────────────────┐
│ 🔗 Connector Actions              │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │    Connecting...           │  │  ← DISABLED GRAY BUTTON
│  └─────────────────────────────┘  │
│  Fetching metadata...             │  ← LOADING MESSAGE (gray)
│                                   │
│  Fetch available options from the │
│  connector API                    │
└───────────────────────────────────┘
```

**Browser Console Shows:**
```
⏳ Loading metadata for: Slack Connector
```

### 4. After Fetch Completes - Success State

```
┌───────────────────────────────────┐
│ 🔗 Connector Actions              │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │      Connect               │  │  ← BLUE BUTTON (re-enabled)
│  └─────────────────────────────┘  │
│  ✅ Metadata fetched successfully! │  ← SUCCESS (green bg)
│                                   │
│  Fetch available options from the │
│  connector API                    │
└───────────────────────────────────┘
```

**Browser Console Shows:**
```
⏳ Loading metadata for: Slack Connector
✅ Metadata fetched: {channels: Array(5), users: Array(3)}
📊 Available Slack channels: (5) [
  {id: 'C123ABC', name: '#general'},
  {id: 'C456DEF', name: '#engineering'},
  {id: 'C789GHI', name: '#product'},
  {id: 'C012JKL', name: '#marketing'},
  {id: 'C345MNO', name: '#sales'}
]
```

### 5. If Error Occurs - Error State

```
┌───────────────────────────────────┐
│ 🔗 Connector Actions              │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │      Connect               │  │  ← BLUE BUTTON (re-enabled)
│  └─────────────────────────────┘  │
│  ❌ Error: Network failure        │  ← ERROR (red bg)
│                                   │
│  Fetch available options from the │
│  connector API                    │
└───────────────────────────────────┘
```

## Color Guide

- **Blue Button (#0d4d90)**: Normal state
- **Gray Button (#ccc)**: Loading/disabled state
- **Gray Text**: Loading message
- **Green Background (#e8f5e9)**: Success message
- **Red Background (#ffebee)**: Error message

## Expected Behavior

1. **Button appears only for Service Task** - Not visible for Start/End events
2. **Loading takes ~800ms** - Simulates network latency
3. **Success message disappears after 3 seconds** - Auto-clears
4. **Can click Connect multiple times** - Re-fetches metadata (with deduplication)
5. **Console logs all events** - Good for debugging

## Troubleshooting Visual Issues

### Button Not Appearing?

**Check:**
1. Did you click on the Service Task labeled "Send Slack Message"?
2. Is the Service Task selected (should have a blue border)?
3. Look for "Connector Actions" group at the top of the properties panel

### Success Message Not Showing?

**Check:**
1. Wait at least 1 second after clicking (800ms + render time)
2. Check browser console for errors
3. Try clicking the button again

### Console Not Showing Logs?

**Check:**
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Switch to "Console" tab
3. Make sure console level is set to "Info" or "Verbose"

## What Makes This Demo Special?

✨ **Smart Display**: Button only shows for elements with templates
✨ **Real-time Feedback**: Loading, success, and error states
✨ **Event-Driven**: Fires EventBus events for integration
✨ **Cached**: Metadata stored to avoid duplicate API calls
✨ **Extensible**: Easy to connect to real APIs

---

Ready to try it? Run:

```bash
npm install
npm run build
npm run demo
```

Then follow the visual guide above! 🎉
