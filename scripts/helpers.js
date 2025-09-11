import chalk from 'chalk';

export function chalkError(message, emoji = '❌') {
  console.log('');
  console.error(emoji + ' ' + chalk.bgRed.white.bold('Error: ' + message));
}


export function chalkSuccess(message, emoji = '✅') {
  console.log('');
  console.error(emoji + ' ' + chalk.bgGreen.white.bold(' ' + message));
}
