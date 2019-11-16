import chalk from 'chalk';

export default class Logger {
  constructor() {
    this.logFormat = chalk`{green [LOG]} `;
    this.warningFormat = chalk`{yellow [WRN]} - {yellow ⚠} `;
    this.errorFormat = chalk`{red [ERR]} - {red ❗} `;
    this.infoFormat = chalk`{blue [INF]} `;
  }

  writeLine(str) {
    process.stdout.write(`${str}\n`);
  }

  log(message) {
    this.writeLine(this.logFormat + message);
  }

  warning(message) {
    this.writeLine(this.warningFormat + message);
  }

  error(message) {
    this.writeLine(this.errorFormat + message);
  }

  info(message) {
    this.writeLine(this.infoFormat + message);
  }
}
