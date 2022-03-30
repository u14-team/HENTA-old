import * as VKLib from 'vk-io';
import { Henta } from './index';

// Top JS :)
const { VK } = VKLib;

export class VKWorker {
  henta: Henta;
  api: any;
  updates: any;
  VKLib: typeof VKLib;

  constructor(henta: Henta) {
    this.henta = henta;
  }

  init() {
    const vk = new VK({
      pollingGroupId: this.henta.config.public.vk.groupId,
      token: this.henta.config.private.vk.token,
      webhookSecret: this.henta.config.private.vk.webhookSecret,
      webhookConfirmation: this.henta.config.private.vk.webhookConfirmation,
      apiLimit: this.henta.config.public.vk.apiLimit || 20
    });

    this.checkToken(vk);
    this.henta.groupId = this.henta.config.public.vk.groupId;
    this.VKLib = VKLib;
  
    return vk;
  }

  checkToken(vk) {
    vk.api.messages.getConversations({ count: 0 }).catch(err => {
      throw Error(`Вы неправильно указали токен группы в private.json (${err.message})`);
    });
  }

  async start() {
    if (this.henta.config.public.vk.useWebhook) {
      this.henta.log('Запускаю Webhook...');
      await this.henta.vk.updates.startWebhook(this.henta.config.public.vk.webhookOptions || {});
    } else {
      this.henta.log('Запускаю Longpoll...');
      await this.henta.vk.updates.startPolling();
    }
  }
}
