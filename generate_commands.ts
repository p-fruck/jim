/* eslint-disable */
/**
 * Simple script to generate a mardown table as command overview
 * Usage: `npm run gen:cmd`
 */
import CommandService from './src/command.service';

function generateTableRow(service: CommandService, cmd: string): string {
  const { parameters, description } = service.commands[cmd];
  const command = parameters ? `${cmd} ${parameters}` : cmd
  const escapedDescription = description.replace(/[<|>]/g, '\\$&');
  return `|\`${command.replace('|', '\\|')}\`|${escapedDescription}|`
}

async function generateMarkdownTable() {
  const service = await CommandService.init(null, false);
  console.log('| Command | Description |');
  console.log('| ------- | ----------- |');
  Object
    .keys(service.commands)
    .sort()
    .forEach((cmd) => console.log(generateTableRow(service, cmd)));
}

generateMarkdownTable();
