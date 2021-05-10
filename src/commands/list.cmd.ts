import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  description: 'Show tracks in queue',
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    if (jim.queue.length === 0) {
      await jim.sendMessage('No track in queue - Go ahead and add one :notes:', event);
    } else {
      await jim.sendMultilineMessage(jim.queue.map((track) => track.title), event);
    }
  },
};
