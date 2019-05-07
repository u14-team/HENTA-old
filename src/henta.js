const path = require("path");

const { Logger } = require("./core/logger");
const { Cmdline } = require("./core/cmdline");
const { ConfigManager } = require("./core/configManager");
const { PluginManager } = require("./core/pluginManager");
const { HookManager } = require("./core/hookManager");
const { VK } = require("./vk/vk");

const utils = require("./core/utils");

class Henta {
    constructor() {
        Henta.instance = this;

        this.botdir = path.resolve(".");
        this.version = "19.4a";

        // Init subsystems
		this.logger = new Logger(this);
		this.cmdline = new Cmdline(this);
		this.configManager = new ConfigManager(this);
		this.pluginManager = new PluginManager(this);
		this.hookManager = new HookManager(this);
		this.utils = utils;
		this.vk = new VK(this);
    }

    async startEngine() {
        this.logger.log(`HENTA V${this.version}`);
        this.logger.log(`Электро Волк 2019.`);
        this.logger.log(`Бот запущен из директории: ${this.botdir}`);

        this.pluginManager.loadPlugins();
        this.cmdline.exeConfig(this.botdir + "/config.cfg");

        await this.pluginManager.startPlugins();
        this.vk.runLinster().catch(console.error);
    }

    static getInstance() {
        return Henta.instance;
    }
}

module.exports = { Henta, getInstance: Henta.getInstance };
