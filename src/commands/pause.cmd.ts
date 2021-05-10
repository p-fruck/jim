import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  description: 'Pause the current track',
  execute: async (jim: JitsiBot) => {
    await jim.page.evaluate('void audio.pause()');
  },
};
