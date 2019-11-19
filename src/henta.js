import path from 'path';
import fs from 'fs';
import minimist from 'minimist';

import Logger from './logger';
import Cmdline from './cmdLine';
import Plugins from './plugins';
import Config from './config';
import VK from './vk';
import Util from './util';

export default class Henta {
  constructor() {
    this.argv = minimist(process.argv.slice(2));
    this.botdir = path.resolve('.');
    this.version = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`)).version;

    // Init subsystems
    this.config = new Config(this);
    this.logger = new Logger(this);
    this.cmdline = new Cmdline(this);
    this.plugins = new Plugins(this);
    this.vk = new VK(this);
    this.util = new Util(this);

    // Sugar
    this.groupId = this.config.public.vk.groupId;
    this.getPlugin = pluginName => this.plugins.get(pluginName);
    this.log = message => this.logger.log(message);
    this.warning = message => this.logger.warning(message);
    this.error = message => this.logger.error(message);
    this.info = message => this.logger.info(message);

    this.shutdownCallbacks = [];

    process.on('SIGINT', () => this.shutdown());
  }

  async startEngine() {
    try {
      this.info(`Добро пожаловать в HENTA V${this.version}.`);
      if (this.argv.service) {
        this.log('Сервисный режим.');
        return;
      }

      await this.plugins.loadPlugins();
      await this.plugins.startPlugins();
      await this.vk.runLongpoll();

      this.log('Бот запущен и готов к работе.');
      this.plugins.service.checkUpdates();
    } catch (err) {
      this.error(err.stack);
      this.shutdown(-1);
    }
  }

  async shutdown(code = 1) {
    this.log('Завершение работы HENTA...');
    await Promise.all(this.shutdownCallbacks.map(v => v()));
    this.log('Выход.');
    process.exit(code);
  }

  onShutdown(cb) {
    this.shutdownCallbacks.push(cb);
  }
}
