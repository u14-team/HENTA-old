import { promises as fs } from 'fs';
import path from 'path';

export default class Util {
  constructor(henta) {
    this.henta = henta;
  }

  async loadSettings(settingsPath) {
    // TODO: windows
    const fullPath = path.isAbsolute(settingsPath)
      ? settingsPath
      : `${this.henta.botdir}/settings/${settingsPath}`;

    const data = await fs.readFile(fullPath);
    return JSON.parse(data);
  }

  /** Осторожно, название этой функции может меняться. */
  async loadEnts(entsPath) {
    const data = await this.loadSettings(entsPath);
    return [data, this.createFromSlug(data)];
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  pickRandomIndex(array) {
    return Math.floor(Math.random() * array.length);
  }

  createFromSlug(array) {
    return Object.fromEntries(
      array.map(v => [v.slug, v])
    );
  }

  chunk(array, chunkSize) {
    return Array.range(Math.ceil(array.length / chunkSize))
      .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
  }
}
