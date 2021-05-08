import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import config from '../config';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    if (params.length) {
      if (jim.queue.length >= config.playlist.maxSize) {
        jim.sendMessage(`Sorry, I cannot remember more than ${config.playlist.maxSize} tracks :confounded_face:`, event);
      }
      const track = await jim.fetchAudio(params.join(' '));
      jim.queue.push(track);
      if (await jim.page.evaluate('audio.ended || audio.currentTime === 0')) {
        await jim.onAudioEnded();
      }
    }
    jim.sendMultilineMessage(jim.queue.map((track) => track.title), event);
  },
  description: '<url|searchTerm> - Add track to queue',
};
