import { promises as fs } from 'fs';

export default class Util {
  constructor(henta) {
    this.henta = henta;
  }

  async loadSettings(path) {
    const data = await fs.readFile(`${this.henta.botdir}/settings/${path}`);
    return JSON.parse(data);
  }

  async pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  chunk(array, chunkSize) {
    return Array.range(Math.ceil(array.length / chunkSize))
      .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
  }
}
