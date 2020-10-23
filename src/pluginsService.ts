import Henta from './index';

export class PluginServiceMeta {
  repository: string;
  version: string;
}

export default class PluginsService {
  henta: Henta;
  pluginsMeta = [];

  constructor(henta: Henta) {
    this.henta = henta;
  }

  async init() {
    this.pluginsMeta = await this.henta.util.loadConfig('pluginsMeta.json');
  }

  async start() {
    const updates = await this.checkUpdates();
    updates.forEach(v => {
      this.henta.log(`Доступно обновление для ${v.slug}`);
    })
  }

  async checkUpdates() {
    const checks = await Promise.all(this.henta.pluginManager.list.map(v => this.checkUpdate(v)));
    return this.henta.pluginManager.list.map((v, i) => ({ newVersion: checks[i], ...v })).map(v => v.newVersion);
  }

  async checkUpdate(plugin) {
    // Получить список плагинов в репозитории
    // Найти плагин
    // Сравнить версии
  }
}
