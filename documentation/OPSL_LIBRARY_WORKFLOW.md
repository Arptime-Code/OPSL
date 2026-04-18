# OPSL Library Creation Workflow

## Phase 1: Plan Your Library

### Step 1.1: Determine Library Purpose

Define what your library will do:

- What **functions** will it expose?
- What **variables** will it store?
- Will it **import** other libraries to use?

### Step 1.2: Name Your Library

Choose a **unique, descriptive name** that will be used in OPSL IMPORT statements.

- The name must be valid as a folder name
- The name must match the file name (minus extension)
- Case sensitivity matters in IMPORT statements

---

## Phase 2: Create the Library

### Step 2.1: Create Project Directory

Create a new folder for your library development:

```bash
mkdir my-library
cd my-library
```

Your project folder should look like this:
```
my-library/
```

**Why:** You need a self-contained folder that can be saved and imported as a package.

### Step 2.2: Create the Library File

Create `mylib.opsl` inside your project folder:

```
my-library/
└── mylib.opsl
```

**Why:** OPSL libraries are `.opsl` files with OPSL syntax. The file must be named exactly matching the library name.

### Step 2.3: Structure the OPSL File

Organize your OPSL file in the correct order:

1. **Import opsl library first** — The opsl library provides special operations like console output
2. **Import your own library** — If your library needs to call its own functions, import itself
3. **Import other libraries** — Import any JS or OPSL libraries your library needs:
   - For **OPSL libraries**: can be in parent project's **opsl-local** folder (at `opsl-local/libraryname/libraryname.opsl`) OR in **project root** (at `libraryname.opsl` in the root, but ONLY if the library name matches the project folder name)
   - For **JS libraries**: must be in parent project's **opsl-local** folder (at `opsl-local/libraryname/libraryname.js`)
4. **Define variables** — Set all variables that must have values before operations begin
5. **Perform assignments** — Copy values between libraries as needed
6. **Call functions** — Execute functions in any order as needed

Your file should look like this:
```
// Import the native opsl library for special operations
// like console output and function calling via strings
IMPORT [opsl] opsl

// Import your own library if you need to call its own functions
IMPORT [opsl] mylib

// Import other libraries your library needs
// (these must exist in parent project's opsl-local)
IMPORT [js] somelib
IMPORT [js] anotherlib
IMPORT [opsl] anotheropsllib

// Define all variables that must have values before operations begin
VARIABLE mylib.config = "default"
VARIABLE mylib.maxCount = "100"
VARIABLE mylib.enableDebug = "true"

// Copy values between libraries as needed
ASSIGN mylib.startValue = somelib.defaultValue
ASSIGN mylib.output = anotherlib.resultData

// Execute functions - can call functions in other libraries
CALL somelib.initialize
CALL anotherlib.processData

// Variables can be changed anywhere as needed
VARIABLE mylib.status = "running"

// More function calls as needed during execution
CALL anotheropsllib.doSomething

// Final variable changes
VARIABLE mylib.finalResult = "completed"
```

**Why:** The runtime processes instructions sequentially. Variables must be set before use. Libraries must be imported before use. Initializations must complete before function calls that depend on them.

---

## Phase 3: Package with opslpm

### Step 3.1: Save to ~/.opslpm

Navigate to your library project and save it:

```bash
cd /path/to/my-library
opslpm -s
```

**Why:** This copies your entire library project to `~/.opslpm/mylib/` for reuse.

**Options:**
- **Update:** Run `-s` again to overwrite the saved package
- **Different name:** Rename your project folder before saving

### Step 3.2: List Saved Projects (Optional)

Verify your library was saved:

```bash
opslpm -l
```

---

## Phase 4: Use Library in a Project

### Step 4.1: Set Up Parent Project First

Before importing your library, the parent project must have all required libraries in one of these locations:

**In opsl-local folder (for any library):**
```
target-project/
├── main.opsl
└── opsl-local/
    ├── somelib/
    │   └── somelib.js      <- JS library
    └── mylib/
        └── mylib.opsl      <- OPSL library
```

**In project root (for OPSL libraries only):**
```
target-project/
├── main.opsl
├── somelib.opsl            <- OPSL library (ONLY works if folder name is "somelib")
└── opsl-local/
    └── mylib/
        └── mylib.opsl
```

The root location only works if:
- The library is an **OPSL** file (not JS)
- The **file name** (without extension) matches the **project folder name**
  - Example: folder "somelib" can have "somelib.opsl" in root
  - Example: folder "mylib" cannot have "somelib.opsl" in root

JS libraries cannot go in root - they must always be in `opsl-local/libraryname/libraryname.js`.

To set up your target project:
1. Navigate to your target project
2. Import any JS libraries your OPSL library needs: `opslpm -i somelib`
3. Import any OPSL libraries your library needs: `opslpm -i anotheropsllib`
4. Import your library: `opslpm -i mylib`

**Why:** Your library runs within the parent project's runtime context and can only access libraries that exist in the parent's project root or `opsl-local` folder.

### Step 4.2: Import Your Library

```bash
cd /path/to/target-project
opslpm -i mylib
```

The `opsl-local` folder is created automatically if it does not exist.

**Options:**
- **Multiple libraries:** Run `-i` multiple times
- **Different name:** Import then rename the folder in `opsl-local/`

### Step 4.3: Use the Library

Create your main OPSL file that imports and uses your library:

```
target-project/
├── main.opsl
└── opsl-local/
    └── mylib/
        └── mylib.opsl
```

In `main.opsl`, you can:
- **Import** the library: `IMPORT [opsl] mylib`
- **Set variables**: `VARIABLE mylib.input = "value"`
- **Copy variables**: `ASSIGN mylib.copy = somelib.someVar`
- **Call functions**: `CALL mylib.someFunction`

**How CALL works:**
- `CALL library.functionName` executes whatever code the target library defines as "functionName"
- For OPSL libraries, this means running the `.opsl` file at `opsl-local/libraryname/functionname.opsl`
- The called file can do anything a normal OPSL file can do

Example `main.opsl`:
```
IMPORT [opsl] mylib
IMPORT [js] somelib

VARIABLE mylib.input = "value"
CALL mylib.someFunction
```

### Step 4.4: Run Your OPSL File

```bash
opsl main.opsl
```

---

## Workflow Summary

```
1. Plan
   └─ Determine purpose and name

2. Create Library
   └─ Create project folder with .opsl file

3. Package
   └─ opslpm -s to save to ~/.opslpm

4. Use Elsewhere
   └─ Set up parent project first, then opslpm -i mylib to import
```

## File Path Reference

| Path | Purpose |
|------|---------|
| `~/.opslpm/mylib/` | Where saved packages are stored |
| `opsl-local/mylib/mylib.opsl` | OPSL library after import (in opsl-local) |
| `opsl-local/mylib/mylib.js` | JS library after import (in opsl-local) |
| `mylib/mylib.opsl` | OPSL library in source project |
| `projectname.opsl` | OPSL library in project root (only if filename matches folder name) |