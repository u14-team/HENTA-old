const { performance } = require('perf_hooks');

class PluginManager {
	constructor(henta) {
		this.henta = henta;

		this.plugins = {};
		this.instances = {};
	}

	loadPlugins() {
		let pluginsToLoad = require(`${this.henta.botdir}/src/plugins.js`);
		pluginsToLoad.forEach(pluginName => this.loadPlugin(pluginName));
		this.henta.logger.log(`Загружено ${Object.keys(this.plugins).length} плагинов.`);
	}

	loadPlugin(pluginName) {
		this.plugins[pluginName] = {
			name: pluginName,
			instance: require(`${this.henta.botdir}/src/plugins/${pluginName}`),
			startDuration: null
		};

		this.instances[pluginName] = this.plugins[pluginName].instance;
	}

	async startPlugins() {
		let pluginList = Object.values(this.plugins);
		let timedFunction = (p, name, cb) => {
			return async () => {
				let startAt = Date.now();
				await cb();
				p[name] = Date.now() - startAt;
			}
		};

		let initList = pluginList.filter(p => p.instance.init).map(p => timedFunction(p, 'initDuration', p.instance.init));
		let startList = pluginList.filter(p => p.instance.start).map(p => timedFunction(p, 'startDuration', p.instance.start));

		let res = Promise.all(initList.map(p => p()));
		this.henta.logger.log("Инициализация плагинов прошла успешно.");
		await Promise.all(startList.map(p => p()));
		this.henta.logger.log("Запуск плагинов прошёл успешно.");
	}

	getInfo(pluginName) {
		return this.plugins[pluginName];
	}

	get(pluginName) {
		return this.getInfo(pluginName).instance;
	}
}

module.exports = { PluginManager };
