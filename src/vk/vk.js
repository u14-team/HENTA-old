const { VK: VKLibrary, Keyboard } = require('vk-io');
const { VkLongpoll } = require('./longpoll');

class VK {
	constructor(henta) {
		const { configManager } = henta;
		this.henta = henta;
		this.Keyboard = Keyboard;

		this.vkLib = new VKLibrary({
			token: configManager.getConfigPrivate()['vk_token'],
			pollingGroupId: configManager.getConfig()['vk_groupid'],
		});

		this.api = this.vkLib.api;
		this.upload = this.vkLib.upload;

		this.longpoll = new VkLongpoll(this);
	}

	async runLinster() {
		await this.longpoll.run();
	}
}

module.exports = { VK };
