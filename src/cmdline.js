const readline = require('readline');
const fs = require('fs');
const utils = require('./utils');

class Cmdline {
    constructor(henta) {
        this.henta = henta;

        this.commands = {};

        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        this.rl.on('line', input => this.doCommandline(input));

        // Стандартные команды
        this.addCommand({
            tag: "help",
            description: "вывести список команд",
            handler: () => {
                this.henta.logger.log(`Список доступных команд:`);
                for (let key in this.commands) {
                    let cmd = this.commands[key];
                    this.henta.logger.log(`● ${cmd.tag}${cmd.usage && ' '+cmd.usage || ''} - ${cmd.description};`);
                }
            }
        });
    }

    question(str) {
        return new Promise(resolve => this.rl.question(str, resolve));
    }

    async questionYN(str) {
        return await this.question(`${str}? [y/n] `) === 'y';
    }

    doCommandline(input) {
        let args = input.trim().split(' ');
        if (!args[0]) return;

        let command = this.commands[args[0]];
        if (command) {
            if (command.typeList && this.checkTypes(command, args)) return;
            return command.handler(args);
        }

        this.henta.logger.log(`Команда '${args[0]}' не найдена.`);
        this.henta.logger.log(`Введите 'help' для просмотра списка команд.`);
    }

    addCommand(command) {
        this.commands[command.tag] = command;
        return command;
    }

    checkTypes(command, argList) {
        for (var i = 0; i < command.typeList.length; i++) {
            if (utils.typeOf(argList[i+1]) !== command.typeList[i]) {
                logger.log(`Используйте: ${command.tag} ${command.usage}`);
                return true;
            }
        }
    }

    exeConfig(filename, silent) {
        let lines = fs.readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
        lines.forEach((input) => this.doCommandline(input.toString()));
    }
}

module.exports = { Cmdline };
