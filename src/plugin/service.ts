import { promises as fs } from 'fs';
import {Henta} from '../index';
import AdmZip from 'adm-zip';
import os from 'os';

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
    const fullMeta = { ...pluginMeta, ...await this.henta.pluginRepositoryManager.getPluginInfo(pluginMeta) };
    
    const tempFilePath = `${os.tmpdir()}/henta-plugin-${fullMeta.uuid}.zip`;
    this.henta.log(`Downloading '${fullMeta.slug}' (${fullMeta.uuid}) from ${fullMeta.file}...`);
    await this.henta.util.downloadFile(fullMeta.file, tempFilePath);

    this.henta.log(`Unpacking plugin '${fullMeta.slug}' (${fullMeta.uuid})...`);
    await new Promise(r => new AdmZip(tempFilePath).extractAllToAsync(`src/plugins/${fullMeta.slug}`, true, r));
    fs.unlink(tempFilePath);

    pluginMeta.version = fullMeta.version;
    this.save();
    this.henta.log(`${fullMeta.slug} ${fullMeta.version} installed.`);
  }

  async start() {
    const updates = await this.checkUpdates();
    updates.forEach(v => {
      this.henta.log(`New version ${v.slug} [${v.version} > ${v.newVersion}]`);
    });
  }

  async checkUpdates() {
    const checks = await Promise.all(this.pluginsMeta.map(v => this.checkUpdate(v)));
    return this.pluginsMeta.map((v, i) => ({ newVersion: checks[i], ...v })).filter(v => v.newVersion);
  }

  async checkUpdate(pluginMeta) {
    const repoMeta = await this.henta.pluginRepositoryManager.getPluginInfo(pluginMeta);
    return repoMeta.version === pluginMeta.version ? false : repoMeta.version;
  }

  async save() {
    fs.writeFile('config/plugins-meta.json', JSON.stringify(this.pluginsMeta, null, '\t'));
  }
}
