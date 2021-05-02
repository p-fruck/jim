import JitsiBot from '../bot';
import { IJimCommand } from '../command.service';
import config from '../config';
import { IIncomingMessage } from '../models/jitsi.interface';

/**
 * Returns timestring from seconds, eg 3601 will result in '01:00:01'
 */
function secondsToDateString(seconds: number): string {
  return new Date(seconds * 1000)
    .toLocaleTimeString('de', { timeZone: 'utc' });
}

/**
 * Currently doesn't support durations > 1 day
 */
function formatTime(time: number, duration: number): string {
  const sTime = secondsToDateString(time);
  const sDuration = secondsToDateString(duration);
  if (duration >= 3600) {
    return `${sTime.replace(/^0/, '')}/${sDuration.replace(/^0/, '')}`;
  }
  return `${sTime.replace(/^00.0?/, '')}/${sDuration.replace(/^00.0?/, '')}`;
}

export default <IJimCommand>{
  execute: async (jim: JitsiBot, params: string[], event: IIncomingMessage) => {
    if (params.length === 0) {
      if (jim.currentTrack) {
        const time: number = await jim.page.evaluate('audio.currentTime');
        const duration: number = await jim.page.evaluate('audio.duration');
        jim.sendMessage(`:notes: Currently playing ${jim.currentTrack.title} (${formatTime(time, duration)})`, event);
      } else {
        jim.sendMessage(':mute: No track is currently playing...', event);
      }
    } else {
      const args = params.join('');
      const incrementTime = (seconds: number) => jim.page.evaluate(`audio.currentTime += ${seconds}`);

      if (/^\++$/.test(args)) {
        incrementTime(args.length * config.track.stepSize);
      } else if (/^\+[1-9][0-9]*/.test(args)) {
        incrementTime(parseInt(args.slice(1), 10));
      } else if (/^-+$/.test(args)) {
        incrementTime(args.length * config.track.stepSize * -1);
      } else if (/^-[1-9][0-9]*/.test(args)) {
        incrementTime(parseInt(args.slice(1), 10) * -1);
      } else {
        jim.sendMessage(
          'I didn\'t understand that :confounded_face: Use !track '
        + 'to gather information about the current track, or use an'
        + 'arbitrary amount of + or - to fast forward or rewind. You '
        + 'can also specify a specific amount by typing eg. +30 / -40',
          event,
        );
      }
    }
  },
  description: 'Get information about the current track, or fast forward and rewind '
    + 'using eg. ++ / --- or +40 / -120',
};
