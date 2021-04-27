import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot) => {
    await jim.sendMessages(jim.queue.map((track) => track.title));
  },
  description: 'Show tracks in queue',
};
