import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    await jim.sendMessage('Pong!', event);
  },
  description: 'Emits a life signal',
};
