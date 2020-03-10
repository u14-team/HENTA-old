import { promises as fs } from 'fs';
import path from 'path';

Array.range = function(start, edge, step) {
  // If only one number was passed in make it the edge and 0 the start.
  if (arguments.length == 1) {
    edge = start;
    start = 0;
  }
 
  // Validate the edge and step numbers.
  edge = edge || 0;
  step = step || 1;
 
  // Create the array of numbers, stopping befor the edge.
  for (var ret = []; (edge - start) * step > 0; start += step) {
    ret.push(start);
  }
  return ret;
}

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
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
