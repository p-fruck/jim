import fs from 'fs';
import path from 'path';
import JitsiBot from './jitsi-bot';
import { IIncomingMessage } from './models/jitsi.interface';

export interface IJimCommand {
  // eslint-disable-next-line no-unused-vars
  execute(jim: JitsiBot, params: string[], event: IIncomingMessage): void | Promise<void>;
  description: string;
}

export default class CommandService {
  private jim: JitsiBot;

  public commands: { [key: string]: IJimCommand } = {};

  private constructor(jim: JitsiBot) {
    this.jim = jim;
  }

  // eslint-disable-next-line class-methods-use-this
  static async init(jim: JitsiBot, registerLocalCommands = true) {
    const promises = [];
    const cmdDir = path.join(__dirname, '/commands');
    const service = new CommandService(jim);

    const registerDirectory = (dir: string) => fs
      .readdirSync(dir)
      .filter((filePath) => /.*\.cmd\.[jt]s$/.test(filePath))
      .forEach((filePath) => promises.push(service.registerCommand(dir, filePath)));

    registerDirectory(cmdDir);
    if (registerLocalCommands) {
      registerDirectory(path.join(cmdDir, '/local'));
    }

    await Promise.all(promises);
    return service;
  }

  async registerCommand(cmdDir: string, filePath: string) {
    const [name] = filePath.split('.');
    this.commands[`!${name}`] = <IJimCommand> (await import(`${cmdDir}/${filePath}`)).default;
  }

  async incomingMessage(event: IIncomingMessage): Promise<void> {
    const [cmd, ...params] = event.message.split(' ');
    if (!cmd.startsWith('!')) return;
    const command = this.commands[cmd];
    if (command) {
      command.execute(this.jim, params, event);
    } else {
      this.jim.sendMessage('Are you talking to me? :thinking: Try !help :bulb:', event);
    }
  }
}
