import { parseArgs } from '../src/args.mjs';

const mockArgv = {};
const defaultValues = {};

jest.mock('yargs', () => {
  const yargsMock = jest.fn(() => yargsMock);
  yargsMock.usage = jest.fn().mockReturnThis();
  yargsMock.positional = jest.fn().mockReturnThis();
  yargsMock.option = jest.fn().mockImplementation((name, options) => {
    if (options.default !== undefined) {
      defaultValues[name] = options.default;
    }
    return yargsMock;
  });
  yargsMock.config = jest.fn().mockReturnThis();
  yargsMock.default = jest.fn().mockImplementation((name, value) => {
    defaultValues[name] = value;
    return yargsMock;
  });
  yargsMock.demandCommand = jest.fn().mockReturnThis();
  Object.defineProperty(yargsMock, 'argv', {
    get: () => ({
      ...defaultValues,
      ...mockArgv,
    }),
  });
  return yargsMock;
});

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn(() => ['node', 'marp-dev-preview.mjs']),
}));

describe('Args', () => {
  beforeEach(() => {
    // Reset mockArgv before each test
    for (const key in mockArgv) {
      delete mockArgv[key];
    }
    // Reset hideBin mock
    require('yargs/helpers').hideBin.mockReturnValue(['node', 'marp-dev-preview.mjs']);
  });

  it('should return default port if not specified', () => {
    mockArgv._ = ['test.md'];
    const argv = parseArgs();
    expect(argv.port).toBe(8080);
  });

  it('should return specified port', () => {
    mockArgv._ = ['test.md'];
    mockArgv.port = 3000;
    const argv = parseArgs();
    expect(argv.port).toBe(3000);
  });

  it('should return default verbose as false', () => {
    mockArgv._ = ['test.md'];
    const argv = parseArgs();
    expect(argv.verbose).toBe(false);
  });

  it('should return verbose as true if specified', () => {
    mockArgv._ = ['test.md'];
    mockArgv.verbose = true;
    const argv = parseArgs();
    expect(argv.verbose).toBe(true);
  });

  it('should capture markdown file positional argument', () => {
    mockArgv._ = ['my-presentation.md'];
    const argv = parseArgs();
    expect(argv._[0]).toBe('my-presentation.md');
  });

  it('should return theme-dir if specified', () => {
    mockArgv._ = ['test.md'];
    mockArgv.themeDir = '/path/to/themes';
    const argv = parseArgs();
    expect(argv.themeDir).toBe('/path/to/themes');
  });

  it('should handle config file path', () => {
    mockArgv._ = ['test.md'];
    mockArgv.config = './my-config.json';
    const argv = parseArgs();
    expect(argv.config).toBe('./my-config.json');
  });
});
