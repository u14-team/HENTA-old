import readline from 'readline'
import fs from 'fs'

/** Класс предоставляет интерфейс работы с командной строкой */
export default class Cmdline {
    /**
    * Создает экземпляр Cmdline.
    *
    * @constructor
    * @param {Henta} henta Экземпляр движка.
    */
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

        this.addCommand({
            tag: "exit",
            description: "закрыть HENTA",
            handler: () => {
                process.kill(process.pid, 'SIGINT');
            }
        });
    }

    /**
     * Вывести сообщение в консоль и вернуть ответ
     *
     * @param {String} str Текст сообщения.
     * @return {Promise<String>} Ответ пользователя.
     */
    question(str) {
        return new Promise(resolve => this.rl.question(str, resolve));
    }

    /**
     * Вывести сообщение в консоль и вернуть ответ в формате да/нет
     *
     * @param {String} str Текст сообщения.
     * @return {Promise<Boolean>} Ответ пользователя.
     */
    async questionYN(str) {
        return await this.question(`${str}? [y/n] `) === 'y';
    }

    /**
     * Выполнить команду
     *
     * @param {String} input Текст команды.
     */
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

    /**
     * Добавить команду
     *
     * @param {Object} command Команда.
     * @param {String} command.tag Имя команды.
     * @param {String} command.description Описание команды.
     * @param {Function} command.handler Функция команды.
     * @param {Array<String>} [command.typeList] Аргументы команды.
     * @return {Object} Команда.
     */
    addCommand(command) {
        this.commands[command.tag] = command;
        return command;
    }

    /**
     * Проверить аргументы
     *
     * @param {Object} command Команда.
     * @param {Array<String>} command.typeList Аргументы команды.
     */
    checkTypes(command, argList) {
        for (var i = 0; i < command.typeList.length; i++) {
            if (utils.typeOf(argList[i+1]) !== command.typeList[i]) {
                logger.log(`Используйте: ${command.tag} ${command.usage}`);
                return true;
            }
        }
    }
}
