import fs from 'fs';

export default class Config {
  constructor (henta) {
    Object.assign(this, {
      henta,
      public: JSON.parse(fs.readFileSync(`${henta.botdir}/settings/config.json`)),
      private: JSON.parse(fs.readFileSync(`${henta.botdir}/settings/private.json`))
    })
  }
}