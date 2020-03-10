import Util from './util';
import Vk from './vk';

export default class Henta {
  plugins: Plugins;
  util: Util;
  vk: Vk;

  getPlugin(slug: String): T;
}