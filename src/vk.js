const { VK: VKLibrary, Keyboard } = require('vk-io');

class VK {
	constructor(henta) {
		const { configManager } = henta;
		this.henta = henta;
		this.Keyboard = Keyboard;

		this.vkLib = new VKLibrary({
			token: configManager.getConfigPrivate()['vk_token'],
			pollingGroupId: configManager.getConfig()['vk_groupid'],
		});

		// Check vk_token
		this.vkLib.api.messages.getConversations({ count: 0 }).catch((e) => {
			henta.error(`Вы неправильно указали токен группы в config_private.json (${e.message})`);
			process.exit(1);
		}); // Sample request

		this.api = this.vkLib.api;
		this.upload = this.vkLib.upload;
	}

	runLongpoll() {
        const updates = this.vkLib.updates;
        const startPollingOriginal = updates.startPolling.bind(updates);

        updates.startPolling = async () => {
            await startPollingOriginal();
            updates.pollingHandler = (update) => {
                this.henta.hookManager.run(`vk_${update.type}`, update.object)
					.catch(this.henta.error.bind(this.henta));
        	}
		}

        updates.startPolling()
			.then(() => this.henta.log("Longpoll клиент успешно запущен."))
			.catch((e) => {
				this.henta.error(`У текущего токена нет доступа к группе (${e.message})`);
				this.henta.error(`Укажите правильный токен в config.json`);
				process.exit(1);
			});
    }
}

module.exports = { VK };
