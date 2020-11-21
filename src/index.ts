import minimist from 'minimist';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Modules
import Config from './config.js';
import Logger from './logger.js';
import Util from './util.js';
import Cmd from './cmd.js';
import PluginManager from './plugin/manager.js';
import PluginService from './plugin/service.js';
import { VKWorker } from './vkWorker.js';
import { PluginRepositoryManager } from './plugin/repository.js';
import { VK } from 'vk-io';

export class Henta {
  // Modules
  config = new Config(this);
  logger = new Logger(this);
  util = new Util(this);
  cmd = new Cmd(this);
  pluginRepositoryManager = new PluginRepositoryManager(this);
  pluginManager = new PluginManager(this);
  pluginService = new PluginService(this);
  vkWorker = new VKWorker(this);

  argv = minimist(process.argv.slice(2));
  botdir = path.resolve('.');
  version: string;
  groupId: number;

  // Aliases
  info = (msg: string) => this.logger.info(msg);
  log = (msg: string) => this.logger.log(msg);
  warning = (msg: string) => this.logger.warning(msg);
  error = (msg: string) => this.logger.error(msg);
  getPlugin = (pluginSlug: string) => this.pluginManager.getPlugin(pluginSlug);
  shutdownCallbacks = [];
  vk: VK;

  async init() {
    const packageData = await this.util.load(`${path.dirname(fileURLToPath(import.meta.url))}/../package.json`);
    this.version = packageData.version;

    try {
      this.info(`HENTA V${this.version}.`);
      if (this.argv.service) {
        this.warning('Bot started in service mode.');
        return;
      }

      await this.config.init();
      this.vk = await this.vkWorker.init();
      await this.pluginService.init();
      await this.pluginManager.loadPlugins();
      await this.pluginManager.initPlugins();
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      this.error(`Bot init: ${error.stack}`);
      this.shutdown(1);
    }
  }// 

  async start() {
    try {
      await this.pluginManager.startPlugins();
      await this.vkWorker.start();

      process.on('uncaughtException', error => {
        this.error(`Runtime error: ${error.stack}`);
      });

      this.log('The bot is up and running.');
      this.pluginService.start();
    } catch (error) {
      this.error(`Bot start: ${error.stack}`);
      this.shutdown(1);
    }
  }

  /* Shutdown bot */
  async shutdown(code = 0) {
    this.log('Shutting down HENTA...');
    await Promise.all(this.shutdownCallbacks.map(v => v()));
    this.log('Exit.');
    process.exit(code);
  }

  onShutdown(cb) {
    this.shutdownCallbacks.push(cb);
  }
}