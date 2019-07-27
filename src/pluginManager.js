const chalk = require('chalk');

class PluginManager {
	constructor(henta) {
		this.henta = henta;

		this.plugins = {};
		this.instances = {};
	}

	loadPlugins() {
		const pluginsToLoad = require(`${this.henta.botdir}/plugins.json`);
		pluginsToLoad.map(p => p.path + '/' + p.name).forEach(pluginName => this.loadPlugin(pluginName));
		this.henta.logger.log(`Загружено ${Object.keys(this.plugins).length} плагинов.`);
	}

	loadPlugin(pluginName) {
		try {
			const pluginClass = require(`${this.henta.botdir}/src/plugins/${pluginName}`);

			this.plugins[pluginName] = {
				name: pluginName,
				instance: new pluginClass(this.henta)
			};

			this.instances[pluginName] = this.plugins[pluginName].instance;
		} catch(e) {
			this.henta.error(`Ошибка в плагине ${chalk.white(pluginName)} (конструктор):\n${e.stack}`);
		}
	}

	async startPlugins() {
		const pluginList = Object.values(this.plugins);
		const timedFunction = (plugin, method) => {
			return async () => {
				const startAt = Date.now();

				try {
					this.henta.hookManager.runOut(`plugin_${plugin.name}_${method}_start`);
					await plugin.instance[method].call(plugin.instance, this.henta);
					this.henta.hookManager.runOut(`plugin_${plugin.name}_${method}_end`);
				} catch(e) {
					plugin[method + "Error"] = e;
					this.henta.error(`Ошибка в плагине ${chalk.white(plugin.name)} (${chalk.white(method)}):\n${e.stack}`);
				}

				plugin[method + "Duration"] = Date.now() - startAt;
			}
		};

		const initList = pluginList.filter(p => p.instance.init).map(p => timedFunction(p, 'init'));
		const startList = pluginList.filter(p => p.instance.start).map(p => timedFunction(p, 'start'));

		await Promise.all(initList.map(p => p()));
		this.henta.log("Инициализация плагинов прошла успешно.");
		if (pluginList.filter(p => p.initError).length > 0)
			this.henta.warning(`Не инициализировались: ${pluginList.filter(p => p.initError).map(p => p.name)}`);
		await Promise.all(startList.map(p => p()));
		this.henta.log("Запуск плагинов прошёл успешно.");
		if (pluginList.filter(p => p.startError).length > 0)
			this.henta.warning(`Не запустились: ${pluginList.filter(p => p.startError).map(p => p.name)}`);
	}

	getInfo(pluginName) {
		if(!this.plugins[pluginName])
			throw new Error(`Plugin "${chalk.white(pluginName)}" not found`)

		return this.plugins[pluginName];
	}

	get(pluginName) {
		return this.getInfo(pluginName).instance;
	}
}

module.exports = { PluginManager };
