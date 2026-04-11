# TCP Communication Flow - Visual Guide

## What Happens When a Library Loads

```
┌─────────────────────────────────────────────────────────┐
│  hello.js LIBRARY CODE                                   │
│                                                          │
│  await TCPClient.connect('hello');  ← Connect to server │
│  await TCPClient.init('hello', 4001); ← Start local srv │
│  await TCPClient.registerFunction('greet', fn); ← Reg   │
│  await TCPClient.set('testVar', 'initial'); ← Store var │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  TCP WORKER (tcp-workers.js)                             │
│                                                          │
│  • Provides TCPClient API to library                     │
│  • Wraps library code in async context                   │
│  • Manages TCP connection to server                      │
│  • Handles incoming function calls                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  TCP SERVER (port 3000)                                  │
│                                                          │
│  • Knows about all libraries                             │
│  • Routes messages between them                          │
│  • Stores variables for each library                     │
│  • Knows which functions each library has                │
└─────────────────────────────────────────────────────────┘
```

## What Happens When OPSL Calls a Function

```
OPSL File:                    TCP Server:              Library:
            
CALL test.sayHello    →      Route to test    →      Execute sayHello()
                                   ←                      ↓
                             Return result        console.log("Hello!")
```

## Step-by-Step Example

### 1. Library Loads and Registers

```javascript
// hello.js executes:
await TCPClient.connect('hello');
```
**What happens:**
- hello.js connects to TCP server on port 3000
- Server now knows "hello" library exists

```javascript
await TCPClient.init('hello', 4001);
```
**What happens:**
- hello.js starts its own local server on port 4001
- Other libraries can now call functions on hello by connecting to port 4001
- Server records: "hello library is on port 4001"

```javascript
await TCPClient.registerFunction('greet', async function() {
    console.log("Hello!");
});
```
**What happens:**
- Server records: "hello library has function 'greet'"
- When someone wants to call 'greet', server knows to route to hello library

```javascript
await TCPClient.set('testVar', 'initial');
```
**What happens:**
- Server stores: "hello.testVar = 'initial'"
- Any library can retrieve this value later

### 2. OPSL File Uses the Library

```opsl
IMPORT [js] hello
```
**What happens:**
- runtime-tcp.js creates a TCPWorker for hello
- TCPWorker loads hello.js
- hello.js executes and registers itself (as shown above)

```opsl
VARIABLE hello.myVar = "new value"
```
**What happens:**
- runtime tells TCP server: "Set hello.myVar = 'new value'"
- Server updates hello's variables

```opsl
CALL hello.greet
```
**What happens:**
- runtime tells TCP server: "Call hello.greet"
- Server routes to hello library's local server
- hello executes greet() function
- Result returns through TCP

### 3. Libraries Communicate

```
Library A wants to call Library B's function:

Library A                    TCP Server              Library B
    |                             |                       |
    |-- callRemote('B', 'fn') -->|                       |
    |                             |-- route to B ------> |
    |                             |                       |-- execute fn()
    |                             |                       |
    |                             |<-- result ------------|
    |<-- result -----------------|                       |
```

## Real Example: What You See in Console

```
Using existing TCP server on port 3000
Importing library: hello (js)
[hello] Connected to server              ← hello.js calls TCPClient.connect()
[hello] Connected to TCP server          ← Connection established
[hello] Initialized on port 4001         ← hello.js calls TCPClient.init()
[hello] Registered function: greet       ← hello.js calls TCPClient.registerFunction()
[hello] Set variable: testVar = initial  ← hello.js calls TCPClient.set()
[hello] hello.js loaded - TCP worker initialized
[hello] Loaded and registered
[hello] Hello from greeting! TCP communication is working.  ← Function called!
```

## Key Points

1. **Libraries MUST call TCPClient methods** - this is how they register
2. **Each library gets its own port** - for receiving function calls
3. **All communication goes through server** - server is the hub
4. **Variables stored on server** - accessible by any library
5. **Functions called remotely** - other libraries can execute your functions

## File Structure

```
testing3/
├── test.opsl                    ← OPSL script
├── opsl-local/
│   ├── hello/
│   │   └── hello.js            ← Uses TCPClient API
│   ├── test/
│   │   └── test.js             ← Uses TCPClient API
│   └── greeting/
│       └── greeting.js         ← Uses TCPClient API
```

Every `.js` file in opsl-local **must** use TCPClient to register itself!
