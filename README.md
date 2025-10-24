# ToDo Plugin

This is a generated from the sample plugin for Obsidian (https://obsidian.md).

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in TypeScript Definition format, which contains TSDoc comments describing what it does.

This plugin highlights ToDo and and summarizes them in a list view.

## Requirements

-   Make sure your NodeJS is at least v16 (`node --version`).

## Manually installing the plugin

There are two common ways to install the plugin manually:

Option A — Install from source (development)

1. Clone this repository into your vault's plugin folder:

```bash
git clone <repo-url> "<VaultFolder>/.obsidian/plugins/todo-plugin"
```

2. Change into the plugin folder, install dependencies, and build:

```bash
cd "<VaultFolder>/.obsidian/plugins/todo-plugin"
npm install
npm run build   # or `npm run dev` for watch-mode during development
```

3. Open Obsidian → Settings → Community plugins and enable "ToDo Plugin". If the plugin does not appear, restart Obsidian.

Option B — Install from prebuilt files (quick install)

1. Copy the release files into a plugin folder in your vault (create the folder if needed):

```bash
mkdir -p "<VaultFolder>/.obsidian/plugins/todo-plugin"
cp main.js manifest.json styles.css "<VaultFolder>/.obsidian/plugins/todo-plugin/"
```

2. Open Obsidian → Settings → Community plugins and enable "ToDo Plugin".

Notes

-   Do not copy `node_modules` into your vault. Only the built `main.js`, `manifest.json`, and optional `styles.css` should be placed in the plugin folder for manual installs.
-   Replace `<repo-url>` and `<VaultFolder>` with your repository URL and vault path.

## Usage

Open the ToDo List view to see all discovered ToDo items across your vault.

-   Use the ribbon icon (checkbox glyph) or the command palette entry `Open ToDo List` to open the List View. The view will open in the sidebar.
-   The List View groups ToDos by file and shows a summary (file name and count). Click any item to open the file and jump the editor to the corresponding line.
-   Use the circular ↻ button next to the "All ToDos" heading to refresh the list after editing files.
-   The plugin highlights the literal word `ToDo` in both edit and preview modes so you can spot items inline; the highlight uses theme colors by default and can be customized in Settings.

## Settings

Toggle `Use theme colors` (default: on). If disabled, set `Todo color` (hex) and `Todo background color` (hex or rgba). Open Obsidian Settings → Community plugins → ToDo Plugin to change these options.

## API Documentation

See https://github.com/obsidianmd/obsidian-api
