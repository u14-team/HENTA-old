const path = require("path");

const { Logger } = require("./logger");
const { Cmdline } = require("./cmdline");
const { ConfigManager } = require("./configManager");
const { PluginManager } = require("./pluginManager");
const { HookManager } = require("./hookManager");
const { VK } = require("./vk");

const utils = require("./utils");

class Henta {
    constructor() {
        this.botdir = path.resolve(".");
        this.version = require('../package.json').version;

        // Init subsystems
		this.logger = new Logger(this);
		this.cmdline = new Cmdline(this);
		this.configManager = new ConfigManager(this);
		this.pluginManager = new PluginManager(this);
		this.hookManager = new HookManager(this);
		this.utils = utils;
		this.vk = new VK(this);

        // Sugar
        this.getPlugin = (pluginName) => this.pluginManager.get(pluginName);
        this.log = (message) => this.logger.log(message);
        this.warning = (message) => this.logger.warning(message);
        this.error = (message) => this.logger.error(message);
        this.getConfigValue = (field) => this.configManager.getConfig()[field];
        this.getConfigPrivateValue = (field) => this.configManager.getConfigPrivate()[field];
    }

    async startEngine() {
        this.logger.log(`HENTA ${this.version} (by Электро Волк 2019).`);
        this.pluginManager.loadPlugins();
        await this.pluginManager.startPlugins();
        this.vk.runLongpoll();
    }
}

module.exports = { Henta };
