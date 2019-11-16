import EventEmitter from 'events';

export default class PluginManager {
  instances = {};
  plugins = {};

  constructor(henta) {
    this.henta = henta;

    this.eventEmitter = new EventEmitter();
    this.on = this.eventEmitter.on.bind(this.eventEmitter);
  }

  async loadPlugins() {
    this.henta.log('Загрузка плагинов...');
    const startAt = Date.now();

    const pluginsToLoad = await this.henta.util.loadSettings('plugins.json');
    await Promise.all(pluginsToLoad.map(v => this.loadPlugin(v)));

    this.henta.log(`Плагины успешно загружены (${Object.keys(this.plugins).length} шт./${Date.now() - startAt} мс.).`);
  }

  async loadPlugin(pluginName) {
    try {
      const pluginModule = await import(`${this.henta.botdir}/src/plugins/${pluginName}`);
      const PluginClass = pluginModule.default;

      const pluginData = {
        name: pluginName,
        instance: new PluginClass(this.henta)
      };

      this.plugins[pluginName] = pluginData;
      this.instances[pluginName] = pluginData.instance;
    } catch (error) {
      throw Error(`Ошибка в плагине ${pluginName}:\n${error.stack}`);
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
    const pluginList = Object.values(this.plugins);
    await this.doPluginsMethod(pluginList, 'preInit', 'Прединициализация');
    await this.doPluginsMethod(pluginList, 'init', 'Инициализация');
    await this.doPluginsMethod(pluginList, 'start', 'Запуск');
  }

  getInfo(pluginName) {
    if (!this.plugins[pluginName]) {
      throw new Error(`Плагин "${pluginName}" не найден`);
    }

    return this.plugins[pluginName];
  }

  get(slug) {
    const instance = this.instances[slug];
    if (!instance) {
      throw new Error(`Не найден плагин: ${slug}.`);
    }

    return instance;
  }
}
