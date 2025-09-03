import { createServer } from '../src/server.mjs';
import http from 'http';

jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn(),
  })),
}));

describe('Server', () => {
  it('should create a server', () => {
    const port = 8080;
    const markdownFile = 'test.md';
    const markdownDir = '.';
    const renderMarp = jest.fn();
    const reload = jest.fn();
    const wss = { clients: [] };
    const __dirname = '.';

    createServer(port, markdownFile, markdownDir, renderMarp, reload, wss, __dirname);

    expect(http.createServer).toHaveBeenCalled();
  });
});
