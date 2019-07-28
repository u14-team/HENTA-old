const path = require("path");

const { Logger } = require("./logger");
const { Cmdline } = require("./cmdline");
const { ConfigManager } = require("./configManager");
const { PluginManager } = require("./pluginManager");
const { HookManager } = require("./hookManager");
const { VK } = require("./vk");

const utils = require("./utils");

/** Движок для создания бота */
class Henta {
    /**
    * Создает экземпляр Henta.
    *
    * @constructor
    */
    constructor() {
        /** Директория с ботом */
        this.botdir = path.resolve(".");
        /** Версия движка */
        this.version = require('../package.json').version;

        // Init subsystems
		/** @public */ this.logger = new Logger(this);
		/** @public */ this.cmdline = new Cmdline(this);
		/** @public */ this.configManager = new ConfigManager(this);
		/** @public */ this.pluginManager = new PluginManager(this);
		/** @public */ this.hookManager = new HookManager(this);
		/** @public */ this.utils = utils;
		/** @public */ this.vk = new VK(this);

        // Sugar
        /** pluginManager.get(pluginName) */ this.getPlugin = (pluginName) => this.pluginManager.get(pluginName);
        /** logger.log(message) */ this.log = (message) => this.logger.log(message);
        /** logger.warning(message) */ this.warning = (message) => this.logger.warning(message);
        /** logger.error(message) */ this.error = (message) => this.logger.error(message);
        /** configManager.getConfig()[field] */ this.getConfigValue = (field) => this.configManager.getConfig()[field];
        /** configManager.getConfigPrivate()[field] */ this.getConfigPrivateValue = (field) => this.configManager.getConfigPrivate()[field];
    }

    /**
     * Запустить движок
     *
     * @this HENTA
     */
    async startEngine() {
        this.logger.log(`HENTA ${this.version} (by Электро Волк 2019).`);
        this.pluginManager.loadPlugins();
        await this.pluginManager.startPlugins();
        this.vk.runLongpoll();
    }
}

module.exports = { Henta };
