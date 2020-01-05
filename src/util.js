import { promises as fs } from 'fs';

export default class Util {
  constructor(henta) {
    this.henta = henta;
  }

  async loadSettings(path) {
    // TODO: windows
    const fullPath = path.startsWith('/') ? path : `${this.henta.botdir}/settings/${path}`;
    const data = await fs.readFile(fullPath);
    return JSON.parse(data);
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  chunk(array, chunkSize) {
    return Array.range(Math.ceil(array.length / chunkSize))
      .map((x, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
  }
}
