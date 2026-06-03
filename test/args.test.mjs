import { parseArgs } from '../src/args.mjs';

const mockArgv = {};
const defaultValues = {};

function mockToCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

jest.mock('yargs', () => {
  const yargsMock = jest.fn(() => yargsMock);
  yargsMock.usage = jest.fn().mockReturnThis();
  yargsMock.parserConfiguration = jest.fn().mockReturnThis();
  yargsMock.example = jest.fn().mockReturnThis();
  yargsMock.positional = jest.fn().mockReturnThis();
  yargsMock.option = jest.fn().mockImplementation((name, options) => {
    if (options.default !== undefined) {
      defaultValues[name] = options.default;
      defaultValues[mockToCamelCase(name)] = options.default;
    }
    return yargsMock;
  });
  yargsMock.config = jest.fn().mockReturnThis();
  yargsMock.default = jest.fn().mockImplementation((name, value) => {
    defaultValues[name] = value;
    return yargsMock;
  });
  yargsMock.middleware = jest.fn().mockImplementation((fn) => {
    yargsMock.__middleware = fn;
    return yargsMock;
  });
  yargsMock.demandCommand = jest.fn().mockReturnThis();
  Object.defineProperty(yargsMock, 'argv', {
    get: () => {
      const argv = {
        ...defaultValues,
        ...mockArgv,
      };
      if (!Array.isArray(argv._)) {
        argv._ = [];
      }
      if (yargsMock.__middleware) {
        yargsMock.__middleware(argv);
      }
      return argv;
    },
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
    expect(argv.markdownFile).toBe('my-presentation.md');
  });

  it('should return theme-set if specified', () => {
    mockArgv._ = ['test.md'];
    mockArgv.themeSet = ['/path/to/themes'];
    const argv = parseArgs();
    expect(argv.themeSet).toEqual(['/path/to/themes']);
  });

  it('should support the theme-dir alias', () => {
    mockArgv._ = ['test.md'];
    mockArgv.themeSet = ['/path/to/themes'];
    const argv = parseArgs();
    expect(argv.themeSet).toEqual(['/path/to/themes']);
  });

  it('should handle config file path', () => {
    mockArgv._ = ['test.md'];
    mockArgv.config = './my-config.json';
    const argv = parseArgs();
    expect(argv.config).toBe('./my-config.json');
  });

  it('should keep an explicit markdown-file option over the positional argument', () => {
    mockArgv._ = ['positional.md'];
    mockArgv.markdownFile = 'flag.md';
    const argv = parseArgs();
    expect(argv.markdownFile).toBe('flag.md');
  });

  it('should return example-config as false by default', () => {
    mockArgv._ = ['test.md'];
    const argv = parseArgs();
    expect(argv.exampleConfig).toBe(false);
  });

  it('should return example-config as true if specified', () => {
    mockArgv.exampleConfig = true;
    const argv = parseArgs();
    expect(argv.exampleConfig).toBe(true);
  });
});
