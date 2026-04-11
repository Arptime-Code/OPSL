# OPSL TCP Integration

This project now supports TCP-based inter-process communication for OPSL library orchestration.

## Architecture

### Old System (VM-based)
- **workers.js**: Uses Node.js `vm` module to create isolated execution contexts
- **runtime.js**: Direct in-process execution with VM workers
- Libraries execute in the same process

### New System (TCP-based)
- **tcp-workers.js**: Each library becomes a TCP client with its own local server
- **runtime-tcp.js**: Orchestrates execution via TCP communication
- **tcp-server-v3/**: Central TCP server on port 3000 handles message routing
- Libraries can be in separate processes, enabling cross-process communication

## How TCP Integration Works

1. **Server Startup**: The TCP server starts on port 3000
2. **Worker Initialization**: Each imported library creates a TCP worker that:
   - Connects to the main server
   - Starts its own local server on a unique port
   - Registers functions and variables with the server
3. **Communication**: When OPSL code calls a function:
   - The runtime sends a TCP message to the server
   - The server routes it to the target library's local server
   - The function executes and returns the result via TCP

## Files

### Core TCP Integration
- `tcp-workers.js` - TCP-based worker implementation (replaces VM workers)
- `runtime-tcp.js` - TCP-enabled runtime orchestrator
- `start-tcp-server.js` - Bootstrap script to start the TCP server
- `tcp-server-v3/` - TCP server implementation

### Running OPSL Scripts

#### With TCP (New System):
```bash
cd testing3
node ../runtime-tcp.js test.opsl
```

#### With VM (Original System):
```bash
cd testing
node ../runtime.js test.opsl
```

## Testing

The `testing3/` folder contains tests for the TCP-based system:
- `test.opsl` - Main test with multiple library imports and calls
- `simple_test.opsl` - Simple TCP communication test
- `opsl-local/` - Library files for testing

## Benefits of TCP Integration

1. **Process Isolation**: Each library runs in its own context
2. **Distributed Execution**: Libraries can be on different machines
3. **Language Agnostic**: Any language can participate as a TCP client
4. **Scalability**: Easy to add load balancing and clustering
5. **Monitoring**: TCP traffic can be monitored and logged

## Port Allocation

- **3000**: Main TCP server
- **4000+**: Individual library local servers (auto-assigned)
