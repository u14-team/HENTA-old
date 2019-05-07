const cmdline = require('./cmdline');
const logger = require('./logger');

class Cvar {
  constructor(options) { Object.assign(this, options); }
  setCallback(callback) { this.callback = callback; return this; }
  setValue(newValue) { this.value = newValue; if (this.callback) this.callback(newValue); }
  toString() { return this.value && this.value.toString(); }
}

class ConfigManager {
    constructor(henta) {
        this.henta = henta;

        this.config_vars = {};

        // Команды
        this.henta.cmdline.addCommand({
            tag: "cvars",
            description: "вывести список кваров",
            handler: () => {
                this.henta.logger.log(`Список доступных кваров:`);
                for (let [key, cvar] in this.config_vars)
                    this.henta.logger.log(`● ${cvar.tag} - ${cvar.description};`);
            }
        });

        this.henta.cmdline.addCommand({
            tag: "getcvar",
            usage: "<имя>",
            typeList: ['string'],
            description: "вывести значение квара",
            handler: args => {
                let cvar = this.get(args[1])
                if (!cvar) {
                    this.henta.logger.log(`Квар '${args[1]}' не найден.`);
                    this.henta.logger.log(`Введите 'cvars' для просмотра списка кваров.`);
                    return;
                }

                this.henta.logger.log(`${cvar.tag} = ${cvar}`);
            }
        });

        this.henta.cmdline.addCommand({
            tag: "setcvar",
            usage: "<имя> <значение>",
            typeList: ['string', 'string'],
            description: "установить значение квара",
            handler: (args) => {
                let cvar = this.get(args[1])
                if (!cvar) {
                    this.henta.logger.log(`Квар '${args[1]}' не найден.`);
                    this.henta.logger.log(`Введите 'cvars' для просмотра списка кваров.`);
                    return;
                }

                cvar.setValue(args[2]);
                this.henta.logger.log(`${cvar.tag} = ${cvar}`);
            }
        });
    }

    create(options) {
        let cvar = new Cvar(options);
        this.config_vars[options.tag] = cvar;
        return cvar
    }

    get(tag) {
        return this.config_vars[tag];
    }
}

module.exports = { ConfigManager };
