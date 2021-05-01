import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    await jim.sendMultilineMessage(
      Object
        .keys(jim.cmdService.commands)
        .sort()
        .map((cmd) => `${cmd} - ${jim.cmdService.commands[cmd].description}`),
      event,
    );
  },
  description: 'Display the help menu',
};
