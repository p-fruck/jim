import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot) => {
    await jim.sendMessage('Pong!');
  },
  description: 'Emits a life signal',
};
