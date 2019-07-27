const chalk = require('chalk');
const moment = require('moment');

class Logger {
    constructor(henta) {
        this.logFormat = chalk`{blue (}{red %time%}{blue )} %message%`;
        this.warningFormat = chalk`{blue (}{red %time%}{blue )} {yellow ⚠} %message%`;
        this.errorFormat = chalk`{blue (}{red %time%}{blue )} {red ❗} %message%`;
    }

    log(message) {
        console.log(this.format(this.logFormat, message));
    }

    warning(message) {
        console.log(this.format(this.warningFormat, message));
    }

    error(message) {
        console.log(this.format(this.errorFormat, message));
    }

    format(format, message) {
        return format
            .replace('%message%', message)
            .replace('%time%', moment().format('H:m:s'));
    }
}

module.exports = { Logger };
