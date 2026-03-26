# OPSL - One Programming/Scripting Language

Execute code in multiple languages with persistent context.

## Quick Start

### 1. Start Jupyter Server

```bash
# Create virtual environment and install dependencies
python3 -m venv venv
./venv/bin/pip install ipykernel jupyter
./venv/bin/python -m ipykernel install --user

# Start Jupyter server (no token, no browser)
./venv/bin/jupyter server --NotebookApp.token='' --ServerApp.allow_unauthenticated_access=True --ServerApp.disable_check_xsrf=True --no-browser --port=8888
```

### 2. Use LanguageWorker

```javascript
const LanguageWorker = require("./workers.js");

async function main() {
    const w = new LanguageWorker("python3", "library.py");
    await w.init();

    w.sendInput("x = 42");
    console.log(w.getOutput()); // ""

    w.sendInput("print(x * 2)");
    console.log(w.getOutput()); // "84"

    process.exit(0);
}

main();
```

## API

```javascript
const w = new LanguageWorker(language, libraryFile);
```

- `language`: Kernel name (e.g., "python3", "javascript")
- `libraryFile`: Optional file to load on init

```javascript
await w.init();
```

Initialize the kernel and load library file.

```javascript
w.sendInput(code);
```

Execute code in the persistent kernel session.

```javascript
w.getOutput();
```

Get stdout from the last `sendInput()` call.
