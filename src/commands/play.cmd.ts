import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[]) => {
    if (params.length === 0) {
      await jim.page.evaluate('void audio.play()');
    } else {
      const track = await jim.fetchAudio(params.join(' '));
      await jim.playAudio(track);
    }
  },
  description: '<url|searchTerm> - Play track now, or resume if no params were given',
};
