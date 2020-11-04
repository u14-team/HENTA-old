import { promises as fs } from 'fs';
import {Henta} from '../index';
import AdmZip from 'adm-zip';
import { execSync } from 'child_process';

export class PluginMeta {
  slug: string;
  version: string;
  uuid: string;
  file?: string;
  repository?: string;
} 

export default class PluginsService {
  henta: Henta;
  pluginsMeta: PluginMeta[];

  constructor(henta: Henta) {
    this.henta = henta;
    this.pluginsMeta = [];
  }

  async init() {
    this.pluginsMeta = await this.henta.util.loadConfig('plugins-meta.json');
    await this.checkPlugins();
  }

  checkPlugins() {
    return Promise.all(this.pluginsMeta.map(v => this.checkPlugin(v)));
  }

  async checkPlugin(pluginMeta) {
    const path = `${this.henta.botdir}/src/plugins/${pluginMeta.slug}`;
    const exists = await fs.stat(path).then(() => true).catch(() => false);
    if (exists) {
      return;
    }

    this.henta.log(`Plugin '${pluginMeta.slug}' not found.`);
    await this.installPlugin(pluginMeta);
  }

  async installPlugin(pluginMeta) {
    console.log(",", await this.henta.pluginRepositoryManager.getPluginInfo(pluginMeta))
    const fullMeta = { ...pluginMeta, ...await this.henta.pluginRepositoryManager.getPluginInfo(pluginMeta) };
    console.log(fullMeta)
    this.henta.log(`Downloading '${fullMeta.slug}' (${fullMeta.uuid}) from ${fullMeta.file}...`);
    await this.henta.util.downloadFile(fullMeta.file, `temp/${fullMeta.uuid}.zip`);
    this.henta.log(`Unpacking plugin '${fullMeta.slug}' (${fullMeta.uuid})...`);
    const zip = new AdmZip(`temp/${fullMeta.uuid}.zip`);
    await new Promise(r => zip.extractAllToAsync(`src/plugins/${fullMeta.slug}`, true, r));
    this.henta.log(`Installing '${fullMeta.slug}' (${fullMeta.uuid}) dependencies...`);
    execSync(`cd src/plugins/${fullMeta.slug} && yarn`);
    this.henta.log(`${fullMeta.slug} ${fullMeta.version} installed.`);
    fs.unlink(`temp/${fullMeta.uuid}.zip`);
  }

  async start() {
    const updates = await this.checkUpdates();
    updates.forEach(v => {
      this.henta.log(`Доступно обновление для ${v.slug} [${v.version} > ${v.newVersion}]`);
    });
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
