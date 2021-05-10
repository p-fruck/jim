import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';

export default <IJimCommand> {
  parameters: '<url|searchTerm>',
  description: 'Play track or first result from search term now! Resume if no parameter is provided',
  execute: async (jim: JitsiBot, params: string[]) => {
    if (params.length === 0) {
      await jim.page.evaluate('void audio.play()');
    } else {
      const track = await jim.fetchAudio(params.join(' '));
      await jim.playAudio(track);
    }
  },
};
