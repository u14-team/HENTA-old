import Henta from './index';

export default class PluginManager {
  henta: Henta;
  list = new Array();
  pluginFromSlug = {};
  instanceFromSlug = {};
  bridges = new Array();

  constructor(henta: Henta) {
    this.henta = henta;
  }

  async loadPlugins() {
    this.henta.log('Loading plugins...');
    const pluginList = await this.henta.util.loadConfig('plugins.json');
    const startAt = Date.now();
    await Promise.all(pluginList.map(v => this.loadPlugin(v)));

    this.henta.log(`Plugins loaded successfully (${this.list.length} шт./${Date.now() - startAt} мс.).`);
  }

  async loadPlugin(pluginSlug: string) {
    const pluginPath = `${this.henta.botdir}/src/plugins/${pluginSlug}`;
    const { default: PluginClass } = await import(pluginPath);
    const pluginInfo = {
      slug: pluginSlug,
      instance: new PluginClass(this.henta)
    };
    
    this.pluginFromSlug[pluginSlug] = pluginInfo;
    this.instanceFromSlug[pluginSlug] = pluginInfo.instance;
    this.list.push(pluginInfo);
  }

  async initPlugins() {
    await Promise.all(this.list.filter(v => v.instance.preInit).map(v => v.instance.preInit(this.henta)));
    await Promise.all(this.bridges.filter(v => v.instance.init).map(v => v.instance.init(this.henta)));
    await Promise.all(this.list.filter(v => v.instance.init).map(v => v.instance.init(this.henta)));
  }

  async startPlugins() {
    await Promise.all(this.list.filter(v => v.instance.preStart).map(v => v.instance.preStart(this.henta)));
    await Promise.all(this.bridges.filter(v => v.instance.start).map(v => v.instance.start(this.henta)));
    await Promise.all(this.list.filter(v => v.instance.start).map(v => v.instance.start(this.henta)));
  }

  getPluginInfo(pluginSlug: string) {
    return this.pluginFromSlug[pluginSlug];
  }

  getPlugin(pluginSlug: string) {
    return this.instanceFromSlug[pluginSlug];
  }

  useBridges(bridgesOptions) {
    const bridges = bridgesOptions
      .filter(v => this.getPlugin(v.plugin))
      .map(v => ({ ...v, instance: new v.class(this.henta) }));

    bridges.forEach(v => this.bridges.push(v));
    return bridges;
  }
}
