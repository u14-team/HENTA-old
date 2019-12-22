import EventEmitter from 'events';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import util from 'util';
import { exec } from 'child_process';

const execAsync = util.promisify(exec);

export default class PluginService {
  constructor(plugins) {
    this.henta = plugins.henta;
    this.plugins = plugins;

    this.eventEmitter = new EventEmitter();
    this.on = this.eventEmitter.on.bind(this.eventEmitter);

    this.addCommands();
  }

  addCommands() {
    const { cmdline } = this.henta;
    cmdline.addCommand({
      slug: 'p-update',
      description: 'обновить плагин',
      usage: '<slug>',
      // eslint-disable-next-line no-unused-vars
      handler: ([_, slug]) => {
        this.matchSlug(slug);
        this.updatePlugin(slug);
      }
    });

    cmdline.addCommand({
      slug: 'p-install',
      description: 'установить плагин',
      usage: '<remote>',
      // eslint-disable-next-line no-unused-vars
      handler: ([_, remote]) => {
        this.installPlugin(remote);
      }
    });

    cmdline.addCommand({
      slug: 'p-delete',
      description: 'удалить плагин',
      usage: '<slug>',
      // eslint-disable-next-line no-unused-vars
      handler: async ([_, slug]) => {
        this.matchSlug(slug);
        if (!await cmdline.questionYN(`Удалить плагин '${slug}'`)) {
          this.henta.log('Отменено.');
          return;
        }

        this.deinstallPlugin(slug);
      }
    });
  }

  matchSlug(slug) {
    if (!slug || !slug.match(/^\w+\/\w+$/)) {
      throw Error('Slug невалиден.');
    }

    if (!['common', 'bot', 'systems'].includes(slug.split('/')[0])) {
      throw Error('Неверная категория плагина.');
    }

    return slug;
  }

  checkUpdates() {
    return Promise.all(
      Object.values(this.plugins.list)
        .filter(v => v.meta.version && v.meta.remote)
        .map(v => this.checkUpdate(v.slug))
    );
  }

  async checkUpdate(slug) {
    this.matchSlug(slug);
    const pluginInfo = this.plugins.getInfo(slug);
    if (!pluginInfo.meta.version || !pluginInfo.meta.remote) {
      throw Error(`Плагин '${slug}' локальный.`);
    }

    const remoteInfo = await this.getRemoteData(pluginInfo.meta.remote);
    if (remoteInfo.version === pluginInfo.meta.version) {
      return;
    }

    this.henta.info(`Доступно обновление для плагина '${slug}.`);
    this.henta.info(`${pluginInfo.meta.version} → ${remoteInfo.version}`);
  }

  async updatePlugin(slug) {
    this.matchSlug(slug);
    const pluginInfo = this.plugins.getInfo(slug);
    if (!pluginInfo.meta.version || !pluginInfo.meta.remote) {
      throw Error(`Плагин '${slug}' локальный.`);
    }

    const remoteInfo = await this.getRemoteData(pluginInfo.meta.remote);
    if (remoteInfo.version === pluginInfo.meta.version) {
      throw Error(`Плагин '${slug}' не требует обновлений.`);
    }

    this.henta.log(`Обновление плагина '${slug}'...`);
    await this.deinstallPlugin(slug);
    await this.installPlugin(pluginInfo.meta.remote);
  }

  async deinstallPlugin(slug) {
    this.matchSlug(slug);
    this.plugins.getInfo(slug);
    this.henta.log(`Удаление ${slug}...`);
    await fs.rmdir(`${this.henta.botdir}/src/plugins/${slug}`, { recursive: true });
  }

  async getRemoteData(remote) {
    const result = await fetch(`https://raw.githubusercontent.com/${remote}/master/package.json`);
    try {
      const data = await result.json();
      this.matchSlug(data.slug);
      return data;
    } catch (error) {
      throw Error(`${remote} не является плагином henta.\n${error.stack}`);
    }
  }

  async installPlugin(remote) {
    const pluginData = await this.getRemoteData(remote);
    const subdir = pluginData.slug.split('/')[0];

    try {
      await fs.mkdir(`${this.henta.botdir}/src/plugins/${subdir}`);
    } catch (e) {
      // ...
    }

    try {
      await fs.access(`${this.henta.botdir}/src/plugins/${pluginData.slug}`);
      throw Error(`Плагин '${pluginData.slug}' уже существует`);
    } catch (e) {
      // ...
    }

    await execAsync(`cd ${this.henta.botdir}/src/plugins/${subdir} && git clone https://github.com/${remote}.git`);
    await execAsync(`cd ${this.henta.botdir}/src/plugins/${pluginData.slug} && yarn install || npm install`);

    this.henta.log(`Плагин '${pluginData.slug}' установлен из репозитория '${remote}'.`);
    this.henta.log(`Версия плагина: ${pluginData.version}.`);
  }
}
