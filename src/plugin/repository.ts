import fetch from 'node-fetch';
import {Henta} from '..';
import { PluginMeta } from './service';

export interface PluginRepository {
  index: string;
  data: PluginMeta[];
}

export class PluginRepositoryManager {
  henta: Henta;
  cache = new Map<string, PluginRepository>();

  constructor(henta) {
    this.henta = henta;
  }

  getRepository(index) {
    return this.cache.get(index) || this.loadRepository(index);
  }

  loadRepository(index) {
    return fetch(index).then(async v => ({ index, data: await v.json() })) as Promise<PluginRepository>;
  }

  clearCache() {
    this.cache.clear();
  }

  async getPluginInfo(pluginMeta: PluginMeta) {
    const repository = await this.getRepository(pluginMeta.repository);
    return repository.data.find(v => v.uuid === pluginMeta.uuid);
  }
}