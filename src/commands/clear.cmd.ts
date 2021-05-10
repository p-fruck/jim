import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  description: 'Clear the queue',
  execute: (jim: JitsiBot) => {
    // eslint-disable-next-line no-param-reassign
    jim.queue = [];
  },
};
