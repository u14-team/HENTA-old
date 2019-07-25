const cmdline = require('./cmdline');
const logger = require('./logger');

class ConfigManager {
    constructor(henta) {
        this.henta = henta;

        this.config = require(`${this.henta.botdir}/config.json`);
        this.configPrivate = require(`${this.henta.botdir}/config_private.json`);
    }

    getConfig() {
        return this.config;
    }

    getConfigPrivate() {
        return this.configPrivate;
    }
}

module.exports = { ConfigManager };
