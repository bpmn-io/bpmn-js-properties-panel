# 🎯 HOW TO RUN THE DEMO

**The easiest way: Just run `npm start`!**

For a fully working demo with element templates configured:
```bash
npm install
npm start
```
Then open **http://localhost:9876/debug.html**

📖 **See [test/fixtures/TESTING_CONNECTOR_METADATA.md](test/fixtures/TESTING_CONNECTOR_METADATA.md) for detailed instructions.**

---

**Alternative: Standalone demo (3 commands, 2 minutes)**

---

## The Commands

```bash
npm install
npm run build
npm run demo
```

---

## What Each Command Does

### 1. `npm install`
- Downloads all dependencies
- Takes ~2-3 minutes
- Only needed once (or after pulling new changes)

### 2. `npm run build`
- Compiles the source code
- Creates files in `dist/` folder
- Takes ~10 seconds
- Needed after code changes

### 3. `npm run demo`
- Starts a local web server on port 8080
- You'll see: "🚀 Demo server is running!"
- Leave this running (Ctrl+C to stop later)

---

## After Running

**Open your browser to:**
```
http://localhost:8080/demo/standalone.html
```

You should see:
- ✅ Instructions at the top
- ✅ BPMN diagram in the center
- ✅ Properties panel on the right

---

## What to Do in the Browser

### Step 1: Select the Service Task
Click on the box labeled **"Send Slack Message"** in the diagram.

### Step 2: Find the Connect Button
Look at the properties panel on the right. At the very top, you'll see:
```
Connector Actions
  [  Connect  ]
```

### Step 3: Click Connect
Click the blue "Connect" button.

### Step 4: Watch the Magic
- Button text changes to "Connecting..."
- After ~1 second, you see: ✅ "Metadata fetched successfully!"
- The text appears with a green background

### Step 5: Check the Console
Press **F12** (or Cmd+Option+I on Mac) to open DevTools, then click "Console" tab.

You should see:
```
⏳ Loading metadata for: Slack Connector
✅ Metadata fetched: {channels: Array(5), users: Array(3)}
📊 Available Slack channels: [
  {id: 'C123ABC', name: '#general'},
  {id: 'C456DEF', name: '#engineering'},
  {id: 'C789GHI', name: '#product'},
  {id: 'C012JKL', name: '#marketing'},
  {id: 'C345MNO', name: '#sales'}
]
```

**That's it! You've successfully run the demo!** 🎉

---

## Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Port 8080 already in use"
**Solution:** Use a different port:
```bash
PORT=8081 npm run demo
# Then open: http://localhost:8081/demo/standalone.html
```

### "Button not appearing"
**Solution:** 
1. Make sure you clicked on the Service Task (it should have a blue border)
2. Look for "Connector Actions" at the very top of the properties panel
3. If still not visible, try refreshing the page

### "External resources blocked"
**Solution:** 
The standalone demo loads some libraries from CDN. If blocked by firewall/ad-blocker, use the dev server instead:
```bash
npm start
# Then open: http://localhost:9876/debug.html
```

---

## Need More Help?

📖 **Detailed Guides:**
- [DEMO_GUIDE.md](DEMO_GUIDE.md) - Complete instructions with troubleshooting
- [demo/QUICKSTART.md](demo/QUICKSTART.md) - Quick reference
- [demo/VISUAL_GUIDE.md](demo/VISUAL_GUIDE.md) - Visual walkthrough

💬 **Have Questions?**
See the guides above or check the implementation details in [IMPLEMENTATION.md](IMPLEMENTATION.md)

---

## Quick Commands Reference

```bash
# Install dependencies (first time only)
npm install

# Build the library
npm run build

# Run the demo
npm run demo

# Stop the demo
# Press Ctrl+C in the terminal

# Run tests
npm test

# Run linter
npm run lint
```

---

**Ready? Let's go!**

```bash
npm install && npm run build && npm run demo
```

Then open http://localhost:8080/demo/standalone.html 🚀
