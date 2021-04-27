import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';
import config from '../config';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[]) => {
    if (params.length) {
      if (jim.queue.length >= config.playlist.maxSize) {
        jim.sendMessage(`Sorry, I cannot remember more than ${config.playlist.maxSize} tracks :confounded_face:`);
      }
      const track = await jim.fetchAudio(params.join(' '));
      jim.queue.push(track);
      if (await jim.page.evaluate('audio.ended || audio.currentTime === 0')) {
        await jim.onAudioEnded();
      }
    }
    jim.sendMessages(jim.queue.map((track) => track.title));
  },
  description: '<url|searchTerm> - Add track to queue',
};
