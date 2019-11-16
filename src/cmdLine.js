import readline from 'readline';

export default class Cmdline {
  commands = {};

  constructor(henta) {
    this.henta = henta;

    this.addDefaultCommands();

    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    this.rl.on('line', input => this.doCommandline(input));
  }

  addDefaultCommands() {
    // Стандартные команды
    this.addCommand({
      tag: 'help',
      description: 'вывести список команд',
      handler: () => {
        this.henta.logger.log('Список доступных команд:');
        Object.values(this.commands).forEach(({ tag, usage, description }) => {
          this.henta.log(`● ${tag}${usage ? ` ${usage}` : ''} - ${description}`);
        });
      }
    });

    this.addCommand({
      tag: 'exit',
      description: 'закрыть HENTA',
      handler: () => {
        process.kill(process.pid, 'SIGINT');
      }
    });
  }

  question(str) {
    return new Promise(resolve => this.rl.question(str, resolve));
  }

  async questionYN(str) {
    const response = await this.question(`${str}? [y/n] `);
    return response === 'y';
  }

  doCommandline(input) {
    const args = input.trim().split(' ');
    if (!args[0]) {
      return;
    }

    const command = this.commands[args[0]];
    if (!command) {
      this.henta.logger.log(`Команда '${args[0]}' не найдена.`);
      this.henta.logger.log('Введите \'help\' для просмотра списка команд.');
    }

    return command.handler(args);
  }

  addCommand(command) {
    this.commands[command.tag] = command;
  }
}
