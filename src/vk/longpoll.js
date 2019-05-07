class VkLongpoll {
    constructor(vk) {
        this.vk = vk;
    }

    async run() {
        await this.vk.vk_io.updates.startPolling();
        //this.vk.vk_io.updates.use(ctx => console.log(ctx.payload.action));
        //this.vk.vk_io.updates.use(ctx => this.vk.henta.hookManager.doAction(`vk_${ctx.payload.action.type}`, ctx));
        this.vk.vk_io.updates.pollingHandler = async (update) => {
            try {
                this.vk.henta.hookManager.doAction(`vk_${update.type}`, update.object);
    		} catch (error) {
    			console.error(error);
    		}
        }


        this.vk.henta.logger.log("Longpoll клиент успешно запущен.");
    }
}

module.exports = { VkLongpoll };
