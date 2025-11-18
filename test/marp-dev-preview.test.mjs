// This test uses a mock for the express module.
// The mock is defined in __mocks__/express.js and configured in jest.config.mjs.
// This is necessary because jest has issues with importing express, which is a CJS module,
// in a project that uses ES modules ("type": "module" in package.json).
import { createServer } from '../src/server.mjs';

describe('Server', () => {
  it('should create a server', () => {
    const markdownDir = '.';
    const renderMarp = jest.fn();
    const reload = jest.fn();
    const wss = { clients: [] };
    const __dirname = '.';

    const app = createServer(markdownDir, renderMarp, reload, wss, __dirname);

    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });
});
