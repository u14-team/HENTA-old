import * as minimist from 'minimist';
import * as path from 'path';
// Modules
import Config from './config';
import Logger from './logger';
import Util from './util';
import Cmd from './cmd';
import PluginManager from './pluginManager';
import VK from './vk';

export default class Henta {
  // Modules
  config = new Config(this);
  logger = new Logger(this);
  util = new Util(this);
  cmd = new Cmd(this);
  pluginManager = new PluginManager(this);
  vk = new VK(this);

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

  async init() {
    const packageData = await this.util.load(`${__dirname}/../package.json`);
    this.version = packageData.version;

    try {
      this.info(`HENTA V${this.version}.`);
      if (this.argv.service) {
        this.warning('Bot started in service mode.');
        return;
      }

      await this.config.init();
      await this.vk.init();
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
      await this.vk.runLongpoll();

      process.on('uncaughtException', error => {
        this.error(`Runtime error: ${error.stack}`);
      });

      this.log('The bot is up and running.');
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