import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import config from '../config';

export default <IJimCommand> {
  description: 'Skip current track and play next one',
  execute: (jim: JitsiBot) => {
    if (jim.queue.length) {
      jim.onAudioEnded();
    } else {
      jim.page.evaluate('audio.src = ""');
      jim.setAvatarUrl(config.bot.avatarUrl);
    }
  },
};
