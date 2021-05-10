import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  description: 'Emit a life signal',
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    await jim.sendMessage('Pong!', event);
  },
};
