import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import config from '../config';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    let gain = <number> await jim.page.evaluate('getGain()');
    if (params.length === 0) {
      jim.sendMessage(`Current volume level equals ${gain}%`, event);
    } else {
      const { stepSize } = config.volume;
      switch (true) {
        case /^(0|100|[1-9][0-9]?)$/.test(params[0]):
          gain = parseInt(params[0], 10);
          break;
        case /^\++$/.test(params[0]):
          gain += params[0].length * stepSize;
          break;
        case /^-+$/.test(params[0]):
          gain -= params[0].length * stepSize;
          break;
        default:
          jim.sendMessage(
            'I did not understand that. Please use !vol to retrieve some '
            + 'volume information, !vol [0-100] to set the volume level '
            + 'directly or !vol (+|-), where each plus or minus increments/'
            + `decrements the total gain by ${stepSize}`,
            event,
          );
          return;
      }
      jim.page.evaluate(`setGain(${gain})`);
    }
  },
  description: 'Retrieve the current volume level if no params where given or adjust '
             + 'it to your needs by setting a volume level between 0 and 100, or by'
             + 'setting a variable amount of + or -',
};
