import path from 'path';
import fs from 'fs';

import Logger from './logger';
import Cmdline from './cmdLine';
import Plugins from './plugins';
import Config from './config';
import VK from './vk';
import Util from './util';

export default class Henta {
  constructor() {
    this.botdir = path.resolve('.');
    this.version = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`)).version;
    this.vkIoVersion = JSON.parse(fs.readFileSync(`${__dirname}/../node_modules/vk-io/package.json`)).version;

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

    this.shutdownCallbacks = [];

    process.on('SIGINT', () => this.shutdown());
  }

  async startEngine() {
    try {
      this.logger.writeLine(`${this.logger.startFormat}Добро пожаловать в HENTA V${this.version}.`);
      this.logger.writeLine(`${this.logger.startFormat}Используется VK-IO ${this.vkIoVersion}.`);

      await this.plugins.loadPlugins();
      await this.plugins.startPlugins();
      await this.vk.runLongpoll();

      this.log('Бот запущен и готов к работе.');
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
