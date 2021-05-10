import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import { IIncomingMessage } from '../models/jitsi.interface';

function generateCommandDescription(jim: JitsiBot, cmdName: string): string {
  const cmd = jim.cmdService.commands[cmdName];
  if (!cmd.parameters) return `${cmdName} - ${cmd.description}`;
  return `${cmdName} ${cmd.parameters} - ${cmd.description}`;
}

export default <IJimCommand> {
  description: 'Display the help menu',
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    await jim.sendMultilineMessage(
      Object
        .keys(jim.cmdService.commands)
        .sort()
        .map((cmd) => generateCommandDescription(jim, cmd)),
      event,
    );
  },
};
