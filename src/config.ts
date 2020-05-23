import Henta from './index';

export default class Config {
  henta: Henta;
  public: any;
  private: any;

  constructor(henta: Henta) {
    this.henta = henta;
  }

  async init() {
    [ this.public, this.private ] = await Promise.all([
      this.henta.util.loadConfig('public.json'),
      this.henta.util.loadConfig('private.json')
    ]);
  } 
}
