import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot) => {
    if (jim.queue.length === 0) {
      await jim.sendMessage('No track in queue - Go ahead and add one :notes:');
    } else {
      await jim.sendMessages(jim.queue.map((track) => track.title));
    }
  },
  description: 'Show tracks in queue',
};
