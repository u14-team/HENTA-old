import * as chalk from 'chalk';
import Henta from './index';

export default class Logger {
  henta: Henta;
  logFormat: string = chalk`{green [LOG]} `;
  warningFormat: string = chalk`{yellow [WRN]} - {yellow ⚠} `;
  errorFormat: string = chalk`{red [ERR]} - {red ❗} `;
  infoFormat: string = chalk`{blue [INF]} `;

  constructor(henta: Henta) {
    this.henta = henta;
  }

  writeLine(str: string) {
    /*if (process.stdout.clearLine) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${str}\n`);
      this.henta.cmdline.rl.prompt(true);
    } else {*/
    process.stdout.write(`${str}\n`);
    // }
  }

  log(message: string) {
    this.writeLine(this.logFormat + message);
  }

  warning(message: string) {
    this.writeLine(this.warningFormat + message);
  }

  error(message: string) {
    process.stderr.write(`${this.errorFormat}${message}\n`);
  }

  info(message: string) {
    this.writeLine(this.infoFormat + message);
  }
}
