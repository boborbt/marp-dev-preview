import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function parseArgs() {
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('markdown-file', {
      alias: 'm',
      describe: 'Path to the markdown file to preview',
      type: 'string'
    })
    .option('theme-set', {
      alias: 't',
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
    .config('config', 'Path to a JSON config file')
    .default('config', '.mp-config.json')
    .argv;
}
