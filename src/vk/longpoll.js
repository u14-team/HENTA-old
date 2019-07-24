class VkLongpoll {
    constructor(vk) {
        this.vk = vk;
    }

    async run() {
        let startPollingOriginal = this.vk.vkLib.updates.startPolling.bind(this.vk.vkLib.updates);

        this.vk.vkLib.updates.startPolling = async () => {
            await startPollingOriginal();
            this.vk.vkLib.updates.pollingHandler = async (update) => {
                try {
                    this.vk.henta.hookManager.doAction(`vk_${update.type}`, update.object);
        		} catch (error) {
        			console.error(error);
        		}
            }
        }

        await this.vk.vkLib.updates.startPolling();
        this.vk.henta.logger.log("Longpoll клиент успешно запущен.");
    }
}

module.exports = { VkLongpoll };
