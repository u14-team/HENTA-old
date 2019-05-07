const { VK } = require('vk-io');
const { VkLongpoll } = require('./longpoll');

class _VK {
	constructor(henta) {
		this.henta = henta;

		this.vk_io = new VK();
		this.vk_io.token = "";
		this.vk_io.options.pollingGroupId = 0;
		this.vk_io.setOptions({ token: '', pollingGroupId: 1 });
		
		this.api = this.vk_io.api;
		this.upload = this.vk_io.upload;

		this.longpoll = new VkLongpoll(this);

		this.henta.configManager.create({
		    tag: "vk_token",
		    description: "access_token VK API",
		    value: this.vk_io.token,
		    callback: value => this.vk_io.token = value
		})

		this.henta.configManager.create({
		    tag: "vk_groupid",
		    description: "ИД группы с ботом",
		    value: this.vk_io.options.pollingGroupId,
		    callback: value => this.vk_io.options.pollingGroupId = Number(value)
		})
	}

	async runLinster() {
		await this.longpoll.run();
	}
}

module.exports = { VK: _VK };
