import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const exampleConfig = {
  'markdown-file': 'my-slides/presentation.md',
  'theme-set': ['my-themes'],
  port: 3000,
  verbose: true,
  containers: ['note', 'info', 'warn', 'important']
};

function toCamelCase(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseArgs() {
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .parserConfiguration({
      'strip-aliased': true,
    })
    .example('$0 --markdown-file slides.md --theme-set themes', 'Preview a markdown deck with custom themes')
    .example('$0', 'Automatically load .mp-config.json when it is present')
    .example('$0 --config preview-config.json', 'Load options from a specific JSON config file')
    .example('$0 --example-config', 'Print an example .mp-config.json and exit')
    .option('markdown-file', {
      alias: 'm',
      describe: 'Path to the markdown file to preview',
      type: 'string'
    })
    .option('containers', {
      alias: 'c',
      describe: 'containers for the markdown-it-containers plugin',
      type: 'array',
      default: ["note", "info", "warn", "important"]
    })
    .option('theme-set', {
      alias: ['t', 'theme-dir'],
      describe: 'Directories for custom themes',
      type: 'array'
    })
    .option('port', {
      alias: 'p',
      describe: 'Port to listen on',
      type: 'number',
      default: 8080
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Enable verbose logging',
      type: 'boolean',
      default: false
    })
    .option('example-config', {
      describe: 'Print an example JSON config file and exit',
      type: 'boolean',
      default: false
    })
    .config('config', 'Path to a JSON config file. .mp-config.json is loaded automatically when present')
    .default('config', '.mp-config.json')
    .middleware(argv => {
      if (!argv.markdownFile && Array.isArray(argv._) && argv._.length > 0) {
        [argv.markdownFile] = argv._;
      }

      argv.exampleConfig = argv.exampleConfig ?? argv[toCamelCase('example-config')] ?? argv['example-config'] ?? false;
    }, true)
    .argv;
}
