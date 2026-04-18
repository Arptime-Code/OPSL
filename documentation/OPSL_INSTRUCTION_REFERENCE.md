# OPSL Instruction Reference

This document explains where and how each OPSL instruction can be used, with visual examples of folder structures.

---

## IMPORT

### Where Libraries Can Be Found

Libraries can be located in two places:

**1. In opsl-local folder (works for both JS and OPSL libraries):**

```
project/
├── main.opsl
└── opsl-local/
    ├── somelib/              <- Library name is folder name
    │   └── somelib.js        <- File name must match folder name
    └── mylib/
        └── mylib.opsl
```

Usage in OPSL:
```
IMPORT [js] somelib
IMPORT [opsl] mylib
```

**2. In project root (only works for OPSL libraries):**

```
project/                       <- Folder name must match file name
├── main.opsl
├── somelib.opsl              <- File "somelib.opsl" in root
└── mylib/
    └── opsl-local/
```

Usage:
```
IMPORT [opsl] somelib         <- Finds "somelib.opsl" in project root
```

**Rules for project root:**
- The library must be an **OPSL file** (not JS)
- The **file name** (without extension) must match the **project folder name**
- Example: folder "somelib" can have "somelib.opsl" in root
- Example: folder "mylib" cannot have "somelib.opsl" in root

---

## VARIABLE

### What It Does

Sets a variable value in a library that has been imported.

### How It Works

```
VARIABLE libraryName.variableName = "value"
```

The library must already be imported. The variable is stored in that library's namespace.

### Example

```
project/
├── main.opsl
└── opsl-local/
    └── mylib/
        └── mylib.opsl
```

In main.opsl:
```
IMPORT [opsl] mylib

VARIABLE mylib.config = "default"
VARIABLE mylib.count = "100"
```

This sets `config = "default"` and `count = "100"` in the mylib library.

---

## ASSIGN

### What It Does

Copies a variable value from one library to another.

### How It Works

```
ASSIGN targetLibrary.targetVariable = sourceLibrary.sourceVariable
```

Both libraries must be imported. The value is read from the source and written to the target.

### Example

```
project/
├── main.opsl
└── opsl-local/
    ├── somelib/
    │   └── somelib.js
    └── mylib/
        └── mylib.opsl
```

In main.opsl:
```
IMPORT [js] somelib
IMPORT [opsl] mylib

VARIABLE somelib.sourceValue = "hello"

ASSIGN mylib.copiedValue = somelib.sourceValue
```

This copies `sourceValue` from somelib to `copiedValue` in mylib.

---

## CALL

### What It Does

Executes a function in a library.

### How It Works

```
CALL libraryName.functionName
```

The library must be imported first. The behavior differs based on library type:

**For OPSL libraries:**

```
project/
├── main.opsl
└── opsl-local/
    └── mylib/
        ├── mylib.opsl        <- Main library file (called with CALL mylib.mylib)
        └── myfunction.opsl   <- Additional function file (called with CALL mylib.myfunction)
```

Calling `CALL mylib.myfunction` executes the file `mylib/myfunction.opsl`.

**For JS libraries:**

```
project/
├── main.opsl
└── opsl-local/
    └── somelib/
        └── somelib.js        <- Contains function definitions
```

Calling `CALL somelib.doSomething` executes the JavaScript function `doSomething` defined in the JS file.

### Example

```
project/
├── main.opsl
└── opsl-local/
    ├── somelib/
    │   └── somelib.js
    └── mylib/
        ├── mylib.opsl
        └── process.opsl
```

In main.opsl:
```
IMPORT [js] somelib
IMPORT [opsl] mylib

// Calls JavaScript function in somelib.js
CALL somelib.initialize

// Calls OPSL function file mylib/process.opsl
CALL mylib.process
```

---

## Special Library: opsl

The `opsl` library is a built-in native library with special functions:

### consoleLog

Prints a value to the console.

```
IMPORT [opsl] opsl
VARIABLE opsl.consoleLog = "Hello World"
CALL opsl.consoleLog
```

Output: `Hello World`

### functionCall

Dynamic function calling via a string variable.

```
IMPORT [opsl] opsl

VARIABLE opsl.functionVar = "mylib.myFunction"
CALL opsl.functionCall
```

This calls `mylib.myFunction` - equivalent to `CALL mylib.myFunction`.

---

## Complete Usage Summary

| Instruction | Purpose | Example |
|--------------|---------|---------|
| IMPORT | Load a library | `IMPORT [js] somelib` |
| VARIABLE | Set a variable | `VARIABLE mylib.value = "data"` |
| ASSIGN | Copy between libraries | `ASSIGN a.x = b.y` |
| CALL | Execute function | `CALL somelib.doSomething` |

---

## Folder Structure Reference

### Full Project Structure

```
project/
├── main.opsl                     <- Main entry point
├── somelib.opsl                  <- OPSL library in root (only if folder is "somelib")
└── opsl-local/
    ├── somelib/
    │   └── somelib.js            <- JS library
    ├── mylib/
    │   ├── mylib.opsl           <- Main OPSL library file
    │   ├── func1.opsl           <- Additional function
    │   └── func2.opsl           <- Additional function
    └── anotherlib/
        └── anotherlib.opsl
```

### Import Resolution Order

1. Check project root (only if library name matches project folder name)
2. Check `opsl-local/libraryName/libraryName.extension`

The runtime stops at the first match found.

### Function Call Resolution

**For OPSL libraries:**
- `CALL mylib.funcName` → runs `opsl-local/mylib/funcName.opsl`

**For JS libraries:**
- `CALL somelib.funcName` → runs the JavaScript function `funcName` in `somelib.js`