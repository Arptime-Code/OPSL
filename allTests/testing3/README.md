# OPSL TCP Integration - Simple Explanation

## What is this?

This is a system that lets different JavaScript files communicate with each other using **TCP networks** - the same kind of networking that powers the internet!

Instead of running all code in one place, each library gets its own "phone line" (TCP connection) and can:
- **Share variables** between libraries
- **Call functions** in other libraries
- **Exchange data** in real-time

## How It Works (Simple Version)

```
┌─────────────────────────────────────────┐
│         TCP Server (Port 3000)          │
│    The "telephone exchange" that        │
│    connects all libraries together      │
└──────────┬──────┬──────┬────────────────┘
           │      │      │
           │      │      │
    ┌──────▼──┐ ┌─▼────┐ ┌▼──────────┐
    │ hello   │ │ test │ │ greeting  │
    │ Lib     │ │ Lib  │ │ Lib       │
    └─────────┘ └──────┘ └───────────┘
```

Each library:
1. **Connects** to the TCP server when imported
2. **Registers** its functions (so others can call them)
3. **Stores** its variables on the server
4. **Communicates** with other libraries through the server

## The Three Main Parts

### 1. TCP Server (`tcp-server-v3/`)
The central "telephone exchange" that routes messages between libraries.

### 2. TCP Workers (`tcp-workers.js`)
Wraps each library with TCP capabilities:
- Connects the library to the server
- Registers functions automatically
- Handles variable storage
- Manages function calls between libraries

### 3. Runtime (`runtime-tcp.js`)
Reads `.opsl` files and executes them using TCP workers instead of local execution.

## How to Make a TCP-Enabled Library

Every library **must** use the TCPClient API to register itself. Here's the pattern:

```javascript
// ========================================
// mylib.js - TCP-enabled library
// ========================================

// Step 1: Connect to TCP server
await TCPClient.connect('mylib');

// Step 2: Initialize with a port number
await TCPClient.init('mylib', 4001);

// Step 3: Register your functions
await TCPClient.registerFunction('hello', async function() {
    console.log("Hello!");
    return "done";
});

await TCPClient.registerFunction('add', async function(a, b) {
    return a + b;
});

// Step 4: Store your variables
await TCPClient.set('myVar', 'some value');
await TCPClient.set('count', '42');

// Step 5: Log that you're ready
console.log("mylib.js loaded and registered!");
```

That's it! The library:
✅ Connects to the TCP server  
✅ Registers its functions (others can now call them!)  
✅ Stores its variables on the server  
✅ Can communicate with other libraries  

## How the TCP Client API Works

When you call `TCPClient.init()`, you get access to these methods:

### TCPClient.init(name, port)
Initialize your library with a name and port number.

```javascript
TCPClient.init('mylib', 4001);
```

### TCPClient.registerFunction(name, fn)
Register a function so other libraries can call it.

```javascript
TCPClient.registerFunction('add', (a, b) => a + b);
```

### TCPClient.set(key, value)
Store a variable on the TCP server.

```javascript
TCPClient.set('username', 'Alice');
```

### TCPClient.get(key)
Get a variable from the server.

```javascript
const username = await TCPClient.get('username');
```

### TCPClient.callRemote(target, function, ...args)
Call a function in another library!

```javascript
// Call the 'add' function in the 'math' library
const result = await TCPClient.callRemote('math', 'add', 5, 10);
```

## Running the System

### Start the TCP Server
```bash
node start-tcp-server.js
```

### Run an OPSL Script
```bash
cd testing3
node ../runtime-tcp.js test.opsl
```

### Run Tests
```bash
./run-tcp-tests.sh
```

## Example: How Variables Flow Through TCP

When you write an OPSL file like this:

```opsl
IMPORT [js] test
VARIABLE test.myVar = "Hello"
CALL test.sayHello
```

Here's what happens:

1. **IMPORT** → Creates a TCP worker for 'test' library
   - test.js connects to TCP server
   - test.js registers its functions
   - test.js is ready to communicate

2. **VARIABLE** → Sends variable over TCP
   - Runtime tells TCP server: "Store test.myVar = 'Hello'"
   - Server saves it in test's space

3. **CALL** → Executes function via TCP
   - Runtime tells TCP server: "Call test.sayHello"
   - Server routes to test library
   - test executes sayHello()
   - Result comes back through TCP

## Port Numbers

Each library needs a unique port:
- **3000** - Main TCP server
- **4001+** - Individual libraries (auto-assigned)

When you call `TCPClient.init('name', port)`, pick a unique port number.

## Files Structure

```
OPSL Project/
├── tcp-workers.js          ← Wraps libraries with TCP
├── runtime-tcp.js          ← Executes .opsl files via TCP
├── start-tcp-server.js     ← Starts the TCP server
├── tcp-server-v3/          ← The TCP server code
│   ├── server/             ← Server-side code
│   └── client/             ← Client-side code (reference)
└── testing3/               ← Test project
    ├── test.opsl           ← Main test script
    └── opsl-local/         ← Library files
        ├── hello/
        │   └── hello.js    ← TCP-enabled library
        ├── test/
        │   └── test.js     ← TCP-enabled library
        └── greeting/
            └── greeting.js ← TCP-enabled library
```

## Benefits of TCP Communication

1. **Isolation** - Each library runs in its own space
2. **Scalability** - Libraries could run on different computers
3. **Monitoring** - All communication goes through server (easy to debug)
4. **Flexibility** - Any programming language can join (just needs TCP support)
5. **Real-time** - Variables and function calls happen instantly over the network

## Quick Start

1. **Create a library**:
   ```javascript
   // mylib.js
   TCPClient.init('mylib', 4001);
   
   function hello() {
       console.log("Hello from mylib!");
   }
   ```

2. **Create an OPSL script**:
   ```opsl
   IMPORT [js] mylib
   CALL mylib.hello
   ```

3. **Run it**:
   ```bash
   node runtime-tcp.js script.opsl
   ```

That's it! Your libraries are now communicating over TCP! 🎉
