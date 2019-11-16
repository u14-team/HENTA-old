import fs from 'fs-extra';

export default class Util {
  constructor(henta) {
    Object.assign(this, {
      henta
    });
  }

  async loadSettings(path) {
    const data = await fs.readFile(`${this.henta.botdir}/settings/${path}`);
    return JSON.parse(data);
  }
}
