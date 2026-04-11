# OPSL Documentation — README

## Quick Start

OPSL is a multi-language execution framework. Write scripts in a custom DSL (`.opsl` files) that orchestrate code across JavaScript, Python, C, and OPSL libraries — all communicating through TCP.

```bash
# After installing: npm install -g .
opsl script.opsl

# Or directly:
node runtimeTCP/main.js script.opsl
```

## Documentation

Open **`documentation/index.html`** in your browser for the full interactive documentation.

## Project Structure

```
OPSL/
├── config.json                    ← Central configuration (all tunable values)
├── package.json                   ← npm package definition
├── bin/opsl-cli.js                ← CLI entry point (the `opsl` command)
├── parser.js                      ← Parses OPSL text → instruction objects
├── tcp-workers.js                 ← Coordinator: delegates to split modules
├── tcp-socket.js                  ← Persistent TCP socket management
├── process-spawner.js             ← Process tracking for cleanup
├── runtimeTCP/                    ← 5 modular orchestration files
│   ├── main.js                    ← Entry point + signal handling
│   ├── runtime.js                 ← Runtime class (inline handlers for speed)
│   ├── server-manager.js          ← TCP server lifecycle
│   ├── library-loader.js          ← Finds .js files, creates workers
│   ├── instruction-handler.js     ← Variable/function helpers
│   └── opsl-executor.js           ← Nested .opsl execution
├── tcp-server-v3/                 ← TCP server + client library
│   ├── server/                    ← 6 files: index, handler, parser, registry, protocol, remote-call
│   └── opsl-tcp-client/           ← npm package: client API for libraries
├── languages/                     ← Language adapters (easy to add new languages)
│   ├── js.js                      ← JS adapter: spawns 'node library.js'
│   └── opsl.js                    ← OPSL adapter: no spawn, nested execution
├── native-library/library.js      ← Dynamic function dispatch
├── start-tcp-server.js            ← Standalone TCP server starter
├── documentation/                 ← Full HTML + markdown documentation
├── visuals/                       ← Interactive architecture visualizations
├── allTests/                      ← Test projects
└── oldFiles/                      ← Deprecated VM-based implementation
```

## The 4 OPSL Instructions

| Instruction | Format | Purpose |
|---|---|---|
| IMPORT | `IMPORT [lang] name` | Load a library (js, py, c, opsl) |
| VARIABLE | `VARIABLE lib.var = "value"` | Store a variable via TCP |
| ASSIGN | `ASSIGN target.name = source.var` | Copy variable between libraries |
| CALL | `CALL lib.functionName` | Execute a function (no parameters) |

## Library Template

Every JS library follows this pattern. Note: **no port needed** (OS assigns automatically) and **no function parameters**:

```javascript
const TCPClient = require('opsl-tcp-client');

function myFunction() {
    // No parameters allowed — read from TCP server if needed
    var value = await TCPClient.get('myVar');
    console.log("Hello!");
    return "result";
}

(async () => {
    await TCPClient.init('libraryName');  // No port — OS assigns one
    await TCPClient.set('myVar', 'value');
    await TCPClient.registerFunction('myFunction', myFunction);
    console.log("loaded and registered");
})();
```

## Key Features

- **Automatic port allocation** — OS assigns free ports via `listen(0)`, no conflicts
- **Global npm package** — `require('opsl-tcp-client')` in every library, no path hacks
- **No function parameters** — functions are called with no args, read state from TCP server
- **Language adapters** — add new languages by creating one small file in `languages/`
- **Central config** — all tunable values in `config.json`
- **Graceful cleanup** — no shell commands, process tracking + signal handlers

## Performance

- **~0.06ms per instruction** (TCP round-trip on localhost)
- **1000-iteration loop in ~1.2 seconds** (with full process isolation)
- **Clean shutdown** on Ctrl+C via signal handlers

## Key Concepts

1. **Each library = separate Node.js process** — isolated memory and event loop
2. **TCP server on port 3000** — central message hub
3. **Persistent socket** — one connection reused for all runtime requests
4. **All values are strings** — no type conversion on the server
5. **Functions read from server** — use `TCPClient.get()` inside functions for current state
