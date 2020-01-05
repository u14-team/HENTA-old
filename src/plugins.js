import EventEmitter from 'events';
import { promises as fs } from 'fs';
import PluginService from './pluginService';

export default class PluginManager {
  instances = {};
  list = {};

  constructor(henta) {
    this.henta = henta;

    this.eventEmitter = new EventEmitter();
    this.on = this.eventEmitter.on.bind(this.eventEmitter);

    this.service = new PluginService(this);
  }

  async loadPlugins() {
    this.henta.log('Загрузка плагинов...');
    const startAt = Date.now();

    const pluginsToLoad = await this.henta.util.loadSettings('plugins.json');
    await Promise.all(pluginsToLoad.map(v => this.loadPlugin(v)));

    this.henta.log(`Плагины успешно загружены (${Object.keys(this.list).length} шт./${Date.now() - startAt} мс.).`);
  }

  // Autoinstall 
  async checkPlugin(slug) {
    try {
      await fs.access(`${this.henta.botdir}/src/plugins/${slug}`);
      // Ok, plugin is exists
    } catch (err) {
      // Plugin not found, find in repo and install
      this.henta.log(`Плагин '${slug}' не найден, попытка установить из SHP.`);
      await this.service.installPlugin(slug.split('/')[1]);
    }
  }

  async loadPlugin(slug) {
    try {
      await this.checkPlugin(slug);
      const pluginModule = await import(`${this.henta.botdir}/src/plugins/${slug}`);
      const PluginClass = pluginModule.default;

      const pluginData = {
        instance: new PluginClass(this.henta),
        meta: JSON.parse(await fs.readFile(`${this.henta.botdir}/src/plugins/${slug}/package.json`)),
        slug
      };

      this.list[slug] = pluginData;
      this.instances[slug] = pluginData.instance;
    } catch (error) {
      throw Error(`Ошибка в плагине ${slug}:\n${error.stack}`);
    }
  }

  makeTimedFunction(plugin, method) {
    return async () => {
      if (!plugin.instance[method]) {
        return;
      }

      const startAt = Date.now();

      try {
        this.eventEmitter.emit(`${plugin.name}:${method}:begin`);
        await plugin.instance[method].call(plugin.instance, this.henta);
        this.eventEmitter.emit(`${plugin.name}:${method}:end`);
      } catch (err) {
        throw Error(`Ошибка в плагине ${plugin.name} (${method}):\n${err.stack}`);
      }

      // eslint-disable-next-line no-param-reassign
      plugin[`duration:${method}`] = Date.now() - startAt;
    };
  }

  async doPluginsMethod(pluginList, method, title) {
    const startAt = Date.now();
    await Promise.all(pluginList.map(v => this.makeTimedFunction(v, method)()));
    this.henta.log(`${title} плагинов прошла успешно (${Date.now() - startAt} мс.).`);
  }

  async startPlugins() {
    const pluginList = Object.values(this.list);
    await this.doPluginsMethod(pluginList, 'preInit', 'Прединициализация');
    await this.doPluginsMethod(pluginList, 'init', 'Инициализация');
    await this.doPluginsMethod(pluginList, 'start', 'Запуск');
  }

  getInfo(slug) {
    const info = this.list[slug];
    if (!info) {
      throw new Error(`Не найден плагин: ${slug}.`);
    }

    return info;
  }

  get(slug) {
    const instance = this.instances[slug];
    if (!instance) {
      throw new Error(`Не найден плагин: ${slug}.`);
    }

    return instance;
  }
}
