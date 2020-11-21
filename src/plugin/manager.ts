import {Henta} from '../index';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

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

  isClass(obj) {
    const isCtorClass = obj.constructor
        && obj.constructor.toString().substring(0, 5) === 'class'
    if(obj.prototype === undefined) {
      return isCtorClass
    }
    const isPrototypeCtorClass = obj.prototype.constructor 
      && obj.prototype.constructor.toString
      && obj.prototype.constructor.toString().substring(0, 5) === 'class'
    return isCtorClass || isPrototypeCtorClass
  }

  async loadPlugin(pluginSlug: string) {
    try {
      const pluginPath = `${this.henta.botdir}/src/plugins/${pluginSlug}`;
      const packageJson = await this.henta.util.load(`${pluginPath}/package.json`);

      // Check installed deps
      if ((packageJson.dependencies || packageJson.devDependencies) && !await fs.access(`${pluginPath}/node_modules`).then(() => true).catch(() => false)) {
        this.henta.warning(`${pluginSlug} not installed dependencies. Installing...`);
        execSync(`cd src/plugins/${pluginSlug} && yarn`, {stdio: 'inherit'});
      }

      // Check building
      if (packageJson.scripts && packageJson.scripts.build && !await fs.access(`${pluginPath}/lib`).then(() => true).catch(() => false)) {
        this.henta.warning(`${pluginSlug} not builded. Building...`);
        execSync(`cd src/plugins/${pluginSlug} && yarn build`, {stdio: 'inherit'});
      }

      const { default: rawPluginClass } = await import(`file:///${pluginPath}/${packageJson.main}`);
      const PluginClass = this.isClass(rawPluginClass) ? rawPluginClass : rawPluginClass.default;
      const pluginInfo = {
        slug: pluginSlug,
        instance: new PluginClass(this.henta)
      };
      
      this.pluginFromSlug[pluginSlug] = pluginInfo;
      this.instanceFromSlug[pluginSlug] = pluginInfo.instance;
      this.list.push(pluginInfo);
      this.henta.log(`Loaded ${pluginSlug}.`);
    } catch (error) {
      this.henta.error(`Load plugin ${pluginSlug}:\n${error.stack}`);
      process.exit();
    }
  }

  async runTask(pluginInfo, task) {
    // this.henta.dev(`[Task] ${pluginInfo.slug}: ${task}`);
    const startAt = Date.now();
    await pluginInfo.instance[task](this.henta);

    pluginInfo.tasks = pluginInfo.tasks || {};
    pluginInfo.tasks[task] = Date.now() - startAt;
  }

  async runTasks(list, task) {
    return Promise.all(list.filter(v => v.instance[task]).map(v => this.runTask(v, task)));
  }

  async initPlugins() {
    await this.runTasks(this.list, 'preInit');
    await this.runTasks(this.bridges, 'init');
    await this.runTasks(this.list, 'init');
    this.henta.log(`Plugins was initialized.`);
  }

  async startPlugins() {
    await this.runTasks(this.list, 'preStart');
    await this.runTasks(this.bridges, 'start');
    await this.runTasks(this.list, 'start');
    this.henta.log(`Plugins was started.`);
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
