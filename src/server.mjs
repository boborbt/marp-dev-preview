import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';

export function createServer(markdownDir, renderMarp, reload, wss, __dirname) {
  const app = express();

  app.use(express.static(markdownDir));
  app.use(express.text({ type: 'text/markdown' }));
  app.use(express.json());

  app.get('/', async (req, res) => {
    try {
      const html = await renderMarp();
      res.send(html);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/client.js', async (req, res) => {
    try {
      const clientJs = await fs.readFile(path.join(__dirname, 'client.js'), 'utf8');
      res.type('js').send(clientJs);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/api/reload', async (req, res) => {
    console.debug("Reload request received");
    console.debug(req.body)
    const success = await reload(req.body);
    if (success) {
      res.json({ status: 'ok' });
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to render markdown' });
    }
  });

  app.post('/api/command', (req, res) => {
    try {
      const command = req.body;
      for (const ws of wss.clients) {
        ws.send(JSON.stringify(command));
      }
      res.json({ status: 'ok', command });
    } catch (e) {
      res.status(400).json({ status: 'error', message: 'Invalid JSON' });
    }
  });

  return app;
}
