import { VK as VKLibrary } from 'vk-io';
// import nanoexpress from 'nanoexpress'

export default class VK extends VKLibrary {
  constructor(henta) {
    super({
      pollingGroupId: henta.config.public.vk.groupId,
      token: henta.config.private.vk.token,
      webhookConfirmation: henta.config.private.vk.webhookConfirmation,
      apiLimit: henta.config.public.vk.apiLimit || 20
    });
    this.henta = henta;

    this.checkToken();
  }

  checkToken() {
    this.api.messages.getConversations({ count: 0 }).catch(err => {
      throw Error(`Вы неправильно указали токен группы в private.json (${err.message})`);
    });
  }

  async runLongpoll() {
    try {
      if (this.henta.config.public.vk.useWebhook) {
        this.henta.log('Запускаю Webhook...');
        this.updates.startWebhook(this.henta.config.public.vk.webhookOptions || {});
      } else {
        this.henta.log('Запускаю Longpoll...');
        this.updates.startPolling();
      }
    } catch (err) {
      throw Error(`Вы неправильно указали ID группы в config.json (${err.message})`);
    }
  }
}
