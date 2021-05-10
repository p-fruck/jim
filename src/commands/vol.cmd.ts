import JitsiBot from '../jitsi-bot';
import { IJimCommand } from '../command.service';
import config from '../config';
import { IIncomingMessage } from '../models/jitsi.interface';

export default <IJimCommand> {
  parameters: '<value>',
  description: 'If no `value` is provided, retrieve the current volume level. Use a number '
             + 'from `0` to `100` or a variable amount of `+` or `-` to adjust the volume',
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
};
