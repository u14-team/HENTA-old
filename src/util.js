import * as fs from 'fs'

export default class Util {
  constructor (henta) {
    Object.assign(this, {
      henta
    })
  }

  loadSettings (path) {
    return new Promise((resolve, reject) =>
      fs.readFile(`${this.henta.botdir}/settings/${path}`, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(JSON.parse(data))
      })
    )
  }
}