#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';

/* Sub-modules */
import { createServer } from './server.mjs';
import { initializeMarp, renderMarp as renderMarpInternal } from './marp-utils.mjs';
import { parseArgs } from './args.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = parseArgs();

const markdownFile = argv._[0]
const themeDir = argv.themeDir;
const port = argv.port;
const verbose = argv.verbose;

if (argv.version) {
  const pkg = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
  console.log(`marp-dev-preview version ${pkg.version}`);
  process.exit(0);
}

if (verbose) {
  console.debug = console.log;
} else {
  console.debug = () => { };
}

if (!markdownFile) {
  console.error('Error: You must provide a path to a markdown file.');
  process.exit(1);
}

const markdownDir = path.dirname(markdownFile);

const wss = new WebSocketServer({ port: port + 1 });

async function renderMarp() {
  const md = await fs.readFile(markdownFile, 'utf8');
  const { html, css } = renderMarpInternal(md);
  const customCss = `
	svg[data-marpit-svg] {
	  margin-bottom:20px !important;
	  border: 1px solid gray;
	  border-radius: 10px;
	  box-shadow: 2px 2px 6px rgba(0,0,0,0.3); 
	}
	#help-box table td, #help-box table th {
	  padding: 0 15px 0 15px;
	}
	#help-box {
	  position: fixed;
	  top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px;
          border-radius: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          z-index: 1001;
          display: none; /* Initially hidden */
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          max-width: 400px;
          text-align: left;
	}
        #command-prompt {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 1.2em;
          z-index: 1000;
          display: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="ws-port" content="${port + 1}">
      <style id="marp-style">${css}</style>
      <style id="custom-style">${customCss}</style>
      <script src="https://unpkg.com/morphdom@2.7.0/dist/morphdom-umd.min.js"></script>
      <script src="/client.js"></script>
       <meta charset="UTF-8">
    </head>
    <body>
      <div id="marp-container">
        ${html}
      </div>
      <div id="help-box">
        <h3>Key Bindings</h3>
        <p>In addition to standard key bindings (e.g., Space, Page Down, Arrow Down, Page Up, Arrow Up), the following key bindings are available:</p>
	<table>
	<tr><th>Key</th><th>Action</th></tr> 
        <tr><td><kbd>gg</kbd> or <kbd>Home</kbd></td><td>Go to first slide</td></tr>
        <tr><td><kbd>G</kbd> or <kbd>End</kbd></td><td>Go to last slide</td></tr>
        <tr><td><kbd>:&lt;number&gt</kbd></td><td>Go to the given slide number</td></tr> 
        <tr><td><kbd>^f</kbd></td><td>Forward one page</td></tr>
        <tr><td><kbd>^b</kbd></td><td>Back one page</td></tr>
        <tr><td><kbd>^d</kbd></td><td>Forward half a page</td></tr>
        <tr><td><kbd>^u</kbd></td><td>Back half a page</td></tr>
        <tr><td><kbd>?</kbd></td><td>Show/hide help</td></tr>
	</table>
      </div>
      <div id="command-prompt"></div>
    </body>
    </html>
  `;
}

async function reload(markdown) {
  try {
    const { html, css } = renderMarpInternal(markdown);
    const message = JSON.stringify({
      type: 'update',
      html: html,
      css: css
    });
    for (const ws of wss.clients) {
      ws.send(message);
    }
    return true;
  } catch (error) {
    console.error('Error rendering or sending update:', error);
    return false;
  }
}

chokidar.watch(markdownFile).on('change', async () => {
  console.debug(`File ${markdownFile} changed, updating...`);
  const md = await fs.readFile(markdownFile, 'utf8');
  await reload(md);
});

initializeMarp(themeDir).then(() => {
  createServer(port, markdownFile, markdownDir, renderMarp, reload, wss, __dirname);
}).catch(error => {
  console.error("Failed to initialize Marp:", error);
  process.exit(1);
});
