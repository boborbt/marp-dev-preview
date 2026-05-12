// This test uses a mock for the express module.
// The mock is defined in __mocks__/express.js and configured in jest.config.mjs.
// This is necessary because jest has issues with importing express, which is a CJS module,
// in a project that uses ES modules ("type": "module" in package.json).
import { createServer } from '../src/server.mjs';
import express from 'express';

describe('Server', () => {
  beforeEach(() => {
    express.static.mockClear();
  });

  it('should create a server', () => {
    const markdownDir = '.';
    const themeDirs = [];
    const renderMarp = jest.fn();
    const reload = jest.fn();
    const wss = { clients: [] };
    const __dirname = '.';

    const app = createServer(markdownDir, themeDirs, renderMarp, reload, wss, __dirname);

    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  it('should mount theme directories before the markdown directory', () => {
    const markdownDir = '/slides';
    const themeDirs = ['/themes/a', '/themes/b'];
    const renderMarp = jest.fn();
    const reload = jest.fn();
    const wss = { clients: [] };
    const __dirname = '.';

    createServer(markdownDir, themeDirs, renderMarp, reload, wss, __dirname);

    expect(express.static).toHaveBeenNthCalledWith(1, '/themes/a');
    expect(express.static).toHaveBeenNthCalledWith(2, '/themes/b');
    expect(express.static).toHaveBeenNthCalledWith(3, '/slides');
  });
});
