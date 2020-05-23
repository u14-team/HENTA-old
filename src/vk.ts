import { VK as VKLibrary } from 'vk-io';
import Henta from './index';

export default class VK extends VKLibrary {
  henta: Henta;

  constructor(henta: Henta) {
    super();
    this.henta = henta;
  }

  init() {
    this.setOptions({
      pollingGroupId: this.henta.config.public.vk.groupId,
      token: this.henta.config.private.vk.token,
      webhookConfirmation: this.henta.config.private.vk.webhookConfirmation,
      apiLimit: this.henta.config.public.vk.apiLimit || 20
    });

    this.checkToken();
    this.henta.groupId = this.henta.config.public.vk.groupId;
  }

  checkToken() {
    this.api.messages.getConversations({ count: 0 }).catch(err => {
      throw Error(`Вы неправильно указали токен группы в private.json (${err.message})`);
    });
  }

  async runLongpoll() {
    if (this.henta.config.public.vk.useWebhook) {
      this.henta.log('Запускаю Webhook...');
      await this.updates.startWebhook(this.henta.config.public.vk.webhookOptions || {});
    } else {
      this.henta.log('Запускаю Longpoll...');
      await this.updates.startPolling();
    }
  }
}
