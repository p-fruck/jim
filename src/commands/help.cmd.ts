import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot) => {
    await jim.sendMessages(
      Object
        .keys(jim.cmdService.commands)
        .sort()
        .map((cmd) => `${cmd} - ${jim.cmdService.commands[cmd].description}`),
    );
  },
  description: 'Display the help menu',
};
