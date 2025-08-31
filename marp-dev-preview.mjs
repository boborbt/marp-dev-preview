#!/usr/bin/env node
import { Marp } from '@marp-team/marp-core';
import { promises as fs } from 'fs';
import http from 'http';
import path from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItMark from 'markdown-it-mark';
import markdownItContainer from 'markdown-it-container';
import morphdom from 'morphdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <markdown-file> [options]')
  .positional('markdown-file', {
    describe: 'Path to the markdown file to preview',
    type: 'string'
  })
  .option('theme-dir', {
    alias: 't',
    describe: 'Directory for custom themes',
    type: 'string'
  })
  .option('port', {
    alias: 'p',
    describe: 'Port to listen on',
    type: 'number',
    default: 8080
  })
  .config('config', 'Path to a JSON config file')
  .default('config', '.mp-config.json')
  .demandCommand(1, 'You must provide a markdown file.')
  .argv;

const markdownFile = argv._[0]
const themeDir = argv.themeDir;
const port = argv.port;

if (!markdownFile) {
  console.error('Error: You must provide a path to a markdown file.');
  process.exit(1);
}

const markdownDir = path.dirname(markdownFile);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const wss = new WebSocketServer({ port: port + 1 });

let marp;

async function initializeMarp() {
  const options = { html: true, linkify: true, };
  marp = new Marp(options)
    .use(markdownItFootnote)
    .use(markdownItMark)
    .use(markdownItContainer, 'note');

  if (themeDir) {
    const themeFiles = await fs.readdir(themeDir);
    for (const file of themeFiles) {
      if (path.extname(file) === '.css') {
        const css = await fs.readFile(path.join(themeDir, file), 'utf8');
        marp.themeSet.add(css);
      }
    }
  }
}


async function renderMarp() {
  const md = await fs.readFile(markdownFile, 'utf8');
  const { html, css } = marp.render(md);
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
      
      <meta charset="UTF-8">
    </head>
    <body>
      ${html}
      <div id="help-box">
        <h3>Key Bindings</h3>
	<table>
	<tr><th>Key</th><th>Action</th></tr> 
        <tr><td><kbd>gg</kbd> or <kbd>Home</kbd></td><td>Go to first slide</td></tr>
        <tr><td><kbd>G</kbd> or <kbd>End</kbd></td><td>Go to last slide</td></tr>
        <tr><td><kbd>:&lt;number&gt</kbd></td><td>Go to the given slide number</td></tr> 
        <tr><td><kbd>?</kbd></td><td>Show/hide help</td></tr>
	</table>
      </div>
      <div id="command-prompt"></div>
    </body>
    </html>
  `;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      const html = await renderMarp();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else if (req.url === '/client.js') {
      const clientJs = await fs.readFile(path.join(__dirname, 'client.js'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(clientJs);
    } else if (req.url === '/api/reload' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        await reload(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
    } else if (req.url === '/api/command' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const command = JSON.parse(body);
          for (const ws of wss.clients) {
            ws.send(JSON.stringify(command));
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', command }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
        }
      });
    } else {
      const assetPath = path.join(markdownDir, req.url);
      const ext = path.extname(assetPath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      try {
        const content = await fs.readFile(assetPath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

async function reload(markdown) {
  try {
    const { html, css } = marp.render(markdown);
    const message = JSON.stringify({
      type: 'update',
      html: html,
      css: css
    });
    for (const ws of wss.clients) {
      ws.send(message);
    }
  } catch (error) {
    console.error('Error rendering or sending update:', error);
  }
}

chokidar.watch(markdownFile).on('change', async () => {
  console.log(`File ${markdownFile} changed, updating...`);
  const md = await fs.readFile(markdownFile, 'utf8');
  await reload(md);
});

initializeMarp().then(() => {
  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port} for ${markdownFile}`);
    if (themeDir) {
      console.log(`Using custom themes from ${themeDir}`);
    }
  });
}).catch(error => {
  console.error("Failed to initialize Marp:", error);
  process.exit(1);
});
