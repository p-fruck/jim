import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot) => {
    await jim.page.evaluate('void audio.pause()');
  },
  description: 'Pause the current track',
};
