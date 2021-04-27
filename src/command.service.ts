import fs from 'fs';
import path from 'path';
import JitsiBot from './bot';
import { IIncomingMessage } from './models/jitsi.interface';

export interface IJimCommand {
  // eslint-disable-next-line no-unused-vars
  execute(jim: JitsiBot, params: string[]): void | Promise<void>;
  description: string;
}

export default class CommandService {
  private jim: JitsiBot;

  public commands: { [key: string]: IJimCommand } = {};

  constructor(jim: JitsiBot) {
    this.jim = jim;
    this.registerDefaultCommands();
    this.incomingMessage.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  async registerDefaultCommands() {
    const cmdDir = path.join(__dirname, '/commands');
    fs
      .readdirSync(cmdDir)
      .filter((filePath) => /.*\.cmd\.[jt]s/.test(filePath))
      .forEach((filePath) => this.registerCommand(cmdDir, filePath));
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
      command.execute(this.jim, params);
    } else {
      this.jim.sendMessage('Are you talking to me? :thinking: Try !help :bulb:');
    }
  }
}
