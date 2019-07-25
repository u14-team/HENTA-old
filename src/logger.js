const chalk = require('chalk');
const moment = require('moment');

class Logger {
    log(message) {
        console.log(`${this.getElement(moment().format('H:m:s'))} ${message}`);
    }

    warning(message) {
        console.log(`${this.getElement(moment().format('H:m:s'))} ${chalk.yellow('⚠')} ${message}`);
    }

    error(message) {
        console.log(`${this.getElement(moment().format('H:m:s'))} ${chalk.red('❗')} ${message}`);
    }

    getElement(data) {
        return `${chalk.blue('[')}${chalk.cyan(data)}${chalk.blue(']')}`;
    }
}

module.exports = { Logger };
