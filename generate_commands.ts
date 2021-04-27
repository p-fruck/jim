/* eslint-disable */
/**
 * Simple script to generate a mardown table as command overview
 * Usage: `npm run gen:cmd`
 */
import CommandService from './src/command.service';

function extractDescription(service: CommandService, cmd: string): string {
  const { description } = service.commands[cmd];
  return description.replace(/[<|>]/g, '\\$&');
}

async function generateMarkdownTable() {
  const service = await CommandService.init(null);
  console.log('| Command | Description |');
  console.log('| ------- | ----------- |');
  Object
    .keys(service.commands)
    .sort()
    .forEach((cmd) => console.log(`|\`${cmd}\`|${extractDescription(service, cmd)}|`));
}

generateMarkdownTable();
