# OPSL Documentation — README

## Quick Start

OPSL is a multi-language execution framework. Write scripts in a custom DSL (`.opsl` files) that orchestrate code across JavaScript, Python, C, and OPSL libraries — all communicating through TCP.

```bash
# Run an OPSL script:
node runtimeTCP/main.js path/to/script.opsl
```

## Documentation

Open **`documentation/index.html`** in your browser for the full interactive documentation with:

- **Getting Started** — installation, first script, library template
- **Architecture** — 6 subsystems, data flow, process model
- **TCP System** — server/client architecture, persistent socket, message protocol
- **API Reference** — TCPClient methods, OPSL instructions, config variables
- **Code Walkthrough** — file-by-file explanations

## Project Structure

```
OPSL/
├── parser.js                    ← Parses OPSL text → instruction objects
├── tcp-workers.js               ← Persistent TCP socket + library spawning
├── runtimeTCP/                  ← 7 modular orchestration files
│   ├── main.js                  ← Entry point
│   ├── runtime.js               ← Runtime class
│   ├── server-manager.js        ← TCP server lifecycle
│   ├── library-loader.js        ← Finds .js files, creates workers
│   ├── instruction-handler.js   ← Processes IMPORT/VARIABLE/ASSIGN/CALL
│   ├── opsl-executor.js         ← Nested .opsl execution
│   └── cleanup.js               ← Shutdown
├── tcp-server-v3/               ← TCP server + client library
│   ├── server/                  ← 6 files: index, handler, parser, registry, protocol, remote-call
│   └── client/                  ← 6 files: api, connection, local-server, protocol, responses, index
├── native-library/library.js    ← Dynamic function dispatch
├── start-tcp-server.js          ← Standalone TCP server starter
├── documentation/               ← This documentation
├── visuals/                     ← Interactive architecture visualizations
├── allTests/                    ← Test projects
└── oldFiles/                    ← Deprecated VM-based implementation
```

## The 4 OPSL Instructions

| Instruction | Format | Purpose |
|---|---|---|
| IMPORT | `IMPORT [lang] name` | Load a library (js, py, c, opsl) |
| VARIABLE | `VARIABLE lib.var = "value"` | Store a variable via TCP |
| ASSIGN | `ASSIGN target.name = source.var` | Copy variable between libraries |
| CALL | `CALL lib.functionName` | Execute a function |

## Library Template

Every JS library follows this pattern:

```javascript
const TCPClient = require('/absolute/path/to/tcp-server-v3/client');

function myFunction() {
    console.log("Hello!");
    return "result";
}

(async () => {
    await TCPClient.init('libraryName', uniquePort);
    await TCPClient.registerFunction('myFunction', myFunction);
    await TCPClient.set('myVar', 'value');
    console.log("loaded and registered");
})();
```

## Performance

- **~0.06ms per instruction** (thanks to persistent TCP sockets)
- **1000 iterations in ~0.7 seconds**
- **1600× faster** than reconnecting per instruction

## Key Concepts

1. **Each library = separate Node.js process** — isolated memory and event loop
2. **TCP server on port 3000** — central message hub
3. **Persistent socket** — one connection reused forever for speed
4. **All values are strings** — no type conversion on the server
5. **Functions must update server** — call `TCPClient.set()` inside functions to share changes
