# opslPM — OPSL Package Manager

A simple tool to save and share OPSL project folders.

## Usage

### Save a Project

Navigate to your OPSL project folder and run:

```bash
opslpm -s
```

This copies the entire folder to `~/.opslpm/<folder-name>`.

### Import a Project

Navigate to your OPSL project and run:

```bash
opslpm -i <project-name>
```

This copies the saved project from `~/.opslpm/<project-name>` into `opsl-local/<project-name>/` in your current directory. If `opsl-local/` doesn't exist, it's created automatically.

### List Saved Projects

```bash
opslpm -l
```

## Examples

```bash
# In your project folder:
cd my-opsl-project
opslpm -s
# → Saved to ~/.opslpm/my-opsl-project

# In another project, import it:
cd other-project
opslpm -i my-opsl-project
# → Copied to ./opsl-local/my-opsl-project/

# See what you have saved:
opslpm -l
# → Lists all projects in ~/.opslpm/
```

## Storage

All saved projects are stored in `~/.opslpm/` — one folder per project.
