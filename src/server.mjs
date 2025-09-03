
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';

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

export function createServer(port, markdownFile, markdownDir, renderMarp, reload, wss, __dirname) {
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
          console.debug("Reload request received");
          const success = await reload(body);
          if (success) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Failed to render markdown' }));
          }
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

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port} for ${markdownFile}`);
  });

  return server;
}
