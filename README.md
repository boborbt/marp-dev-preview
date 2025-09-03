# marp-dev-preview

A lightweight CLI tool for previewing **Marp markdown slide decks** with live reloading, navigation, and development-focused features.  

Unlike the `marp-cli -s` option—which is primarily meant for presenting—this tool is designed specifically for **authoring and iterating** on slides. It provides a live preview server similar to the Marp VS Code extension, but in a terminal-friendly, editor-agnostic way.  

Originally built as a dependency for the [marp-dev-preview.nvim](https://github.com/boborbt/marp-dev-preview.nvim) NeoVim plugin, it can also be used **standalone** or as a dependency in other projects.

---

## ✨ Features

- **Live preview** of Marp markdown files, with position syncing  
- **Incremental updates API** for fast reloads  
- **Automatic browser reload** on file changes  
- **Custom theme support** (CSS-based themes)  
- **Keyboard navigation** for slides  
- Includes several **markdown-it plugins** (easy to extend):
  - `markdown-it-container`
  - `markdown-it-mark`
  - `markdown-it-footnote`

---

## 🚦 Quick Start (via `npx`)

The simplest way to run the previewer:  

```bash
npx marp-dev-preview --theme-dir <themes-dir> <presentation.md>
```

---

## 📦 Installation

Global install (recommended for CLI use):  

```bash
npm install -g marp-dev-preview
```

Or as a local project dependency:  

```bash
npm install marp-dev-preview
```

---

## ▶️ Usage

Start the preview server with:  

```bash
mdp <path-to-markdown-file> [options]
```

**Example:**  

```bash
mdp my-slides/presentation.md --port 3000 --theme-dir my-themes
```

### Options

- `-t, --theme-dir <path>` — Path to custom Marp themes (CSS files)  
- `-p, --port <number>` — Port for the preview server (default: `8080`)  

---

## ⌨️ Keyboard Shortcuts

In addition to normal browser navigation keys (`Page Up`, `Page Down`, `Home`, `End`), the following bindings are available:

- **Ctrl+f** — Forward one page  
- **Ctrl+b** — Backward one page  
- **Ctrl+d** — Forward half a page  
- **Ctrl+u** — Backward half a page  
- **gg** — First slide  
- **G** — Last slide  
- **:number** — Jump to slide `{number}`  
- **?** — Toggle help overlay  

---

## 🔗 API Endpoints

The preview server exposes a simple **HTTP API** for controlling slides and content.

### `POST /api/reload`

Reloads the presentation with new markdown content. The server parses the received markdown, renders it into HTML, and broadcasts the changes to all connected clients. This is ideal for tools that need to push updates without requiring a full page refresh.

- **Request**:
  - **Headers**: `Content-Type: text/markdown`
  - **Body**: Raw markdown content.

- **Response**:
  - `200 OK`: `{ "status": "ok" }` on success.
  - `500 Internal Server Error`: `{ "status": "error", "message": "..." }` on failure.

- **Example**:
  ```bash
  curl -X POST \
       -H "Content-Type: text/markdown" \
       -d "$(cat path/to/your/slides.md)" \
       http://localhost:8080/api/reload
  ```

### `POST /api/command`

Sends a command to the browser to control the presentation's navigation. This allows external tools to programmatically change the visible slide.

- **Request**:
  - **Headers**: `Content-Type: application/json`
  - **Body**: A JSON object describing the command.

- **Response**:
  - `200 OK`: `{ "status": "ok", "command": { ... } }` on success.
  - `400 Bad Request`: `{ "status": "error", "message": "Invalid JSON" }` if the body is malformed.

#### Supported Commands

1.  **`goto`**: Jumps to a specific slide number.
    - **Payload**: `{ "command": "goto", "slide": <number> }`
    - **Example**:
      ```bash
      curl -X POST \
           -H "Content-Type: application/json" \
           -d '{"command": "goto", "slide": 5}' \
           http://localhost:8080/api/command
      ```

2.  **`find`**: Searches for a string and jumps to the first slide containing it. The search is case-insensitive.
    - **Payload**: `{ "command": "find", "string": "<search-term>" }`
    - **Example**:
      ```bash
      curl -X POST \
           -H "Content-Type: application/json" \
           -d '{"command": "find", "string": "My Awesome Slide"}' \
           http://localhost:8080/api/command
      ```


---

## 📄 License

Licensed under the [MIT License](./LICENSE).  
