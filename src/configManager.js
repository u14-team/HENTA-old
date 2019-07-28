const cmdline = require('./cmdline');
const logger = require('./logger');

/** Класс предоставляет интерфейс работы с конфигурацией бота */
class ConfigManager {
    /**
    * Создает экземпляр ConfigManager.
    *
    * @constructor
    * @param {Henta} henta Экземпляр движка.
    */
    constructor(henta) {
        this.henta = henta;

        this.config = require(`${this.henta.botdir}/config.json`);
        this.configPrivate = require(`${this.henta.botdir}/config_private.json`);
    }

    /**
     * Получить публичный конфиг
     *
     * @return {Object} Конфиг.
     */
    getConfig() {
        return this.config;
    }

    /**
     * Получить приватный конфиг
     *
     * @return {Object} Конфиг.
     */
    getConfigPrivate() {
        return this.configPrivate;
    }
}

module.exports = { ConfigManager };
