const chalk = require('chalk');
const moment = require('moment');

/** Класс предоставляет интерфейс вывода в консоль */
class Logger {
     /**
     * Создает экземпляр Logger.
     *
     * @constructor
     * @this  {Logger}
     * @param {Henta} henta Экземпляр движка.
     */
    constructor(henta) {
        this.logFormat = chalk`{blue (}{red %time%}{blue )} %message%`;
        this.warningFormat = chalk`{blue (}{red %time%}{blue )} {yellow ⚠} %message%`;
        this.errorFormat = chalk`{blue (}{red %time%}{blue )} {red ❗} %message%`;
    }

    /**
     * Вывести сообщение в консоль
     *
     * @this   {Logger}
     * @param {String} message Текст сообщения.
     */
    log(message) {
        console.log(this.format(this.logFormat, message));
    }

    /**
     * Вывести предупреждение в консоль
     *
     * @this   {Logger}
     * @param {String} message Текст предупреждения.
     */
    warning(message) {
        console.log(this.format(this.warningFormat, message));
    }

    /**
     * Вывести ошибку в консоль
     *
     * @this   {Logger}
     * @param {String} message Текст ошибки.
     */
    error(message) {
        console.log(this.format(this.errorFormat, message));
    }

    /**
     * Форматировать строку (заменяет %time% и %message%)
     *
     * @private
     * @this   {Logger}
     * @param {String} format Тип формата.
     * @param {String} message Текст.
     * @return {String} Отформатированный текст.
     */
    format(format, message) {
        return format
            .replace('%message%', message)
            .replace('%time%', moment().format('H:m:s'));
    }
}

module.exports = { Logger };
