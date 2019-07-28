const { VK: VKLibrary, Keyboard } = require('vk-io');

/** Класс предоставляет фасад для vk-io */
class VK {
	/**
    * Создает экземпляр VK.
    *
    * @constructor
    * @param {Henta} henta Экземпляр движка.
    */
	constructor(henta) {
		const { configManager } = henta;
		this.henta = henta;
		/** Класс клавиатуры VK-IO */
		this.Keyboard = Keyboard;
		/** Библиотека VK-IO */
		this.vkLib = new VKLibrary({
			token: configManager.getConfigPrivate()['vk_token'],
			pollingGroupId: configManager.getConfig()['vk_groupid'],
		});

		// Check vk_token
		this.vkLib.api.messages.getConversations({ count: 0 }).catch((e) => {
			henta.error(`Вы неправильно указали токен группы в config_private.json (${e.message})`);
			process.exit(1);
		}); // Sample request

		/** VK-IO API */
		this.api = this.vkLib.api;
		/** VK-IO UPLOAD */
		this.upload = this.vkLib.upload;
	}

	/**
     * Запустить LongPoll
     *
     * @private
     */
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
