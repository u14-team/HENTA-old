import Henta from './index';

export default class Plugins {
  henta: Henta;

  /**
  * Get a plugin instance
  * @param {String} path plugin slug
  * @return {T} plugin instance
  */
  getPlugin(slug: String): T;
}
