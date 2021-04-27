import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: (jim: JitsiBot) => {
    // eslint-disable-next-line no-param-reassign
    jim.queue = [];
  },
  description: 'Clear the queue',
};
