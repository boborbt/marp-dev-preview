import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function parseArgs() {
  return yargs(hideBin(process.argv))
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
    .option('verbose', {
      alias: 'v',
      describe: 'Enable verbose logging',
      type: 'boolean',
      default: false
    })
    .config('config', 'Path to a JSON config file')
    .default('config', '.mp-config.json')
    .demandCommand(1, 'You must provide a markdown file.')
    .argv;
}
