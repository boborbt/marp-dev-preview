# marp-dev-preview

A CLI tool to preview Marp markdown files with live reloading and navigation features.

The tool is mainly intended for slide deck authors who want to preview their slides in a web browser during development. In fact, while marp-cli provides a `-s` option to serve the slides, it is mainly intended for presenting the slides, not for development. This tool fills that gap by providing a live preview server presenting the slides similarly to how they are presented in the marp vs-code extension. 

## Features

*   Live preview of Marp markdown files.
*   Automatic browser reload on file changes.
*   Custom theme support.
*   Keyboard navigation for slides.
*   Also installs and uses the following markdown-it plugins:
    *   `markdown-it-container`
    *   `markdown-it-mark`
    *   `markdown-it-footnote`
 
## Usage via npx

The simplest way to start the previewer is via npx:

```bash
npx marp-dev-preview --theme-dir <dir containing your themes> <your presentation>.md
```

## Installation

To install the package globally (recommended for CLI tools):

```bash
npm install -g marp-dev-preview
```

Alternatively, you can install it as a local dependency in your project:

```bash
npm install marp-dev-preview
```

## Usage

To start the preview server, run the `mp` command followed by your markdown file path:

```bash
mp <path-to-your-markdown-file> [options]
```

**Example:**

```bash
mp my-slides/presentation.md --port 3000 --theme-dir my-themes
```

### Options

*   `-t, --theme-dir <path>`: Specify a directory for custom Marp themes (e.g., CSS files).
*   `-p, --port <number>`: Specify the port for the preview server to listen on (default: `8080`).

## Keyboard Shortcuts

While viewing the presentation in your browser, in addition to the usual browser controls (page-up, page-down, home, end, etc.), you can use the following key bindings:

*   <kbd>gg</kbd>: Go to the first slide.
*   <kbd>G</kbd>: Go to the last slide.
*   <kbd>:&lt;number&gt;</kbd>: Go to the specified slide number.
*   <kbd>?</kbd>: Toggle the help box displaying key bindings.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
