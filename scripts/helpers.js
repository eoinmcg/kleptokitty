import chalk from 'chalk';

export function chalkError(message, emoji = '❌') {
  console.log('');
  console.error(emoji + ' ' + chalk.bgRed.black.bold('Error: ' + message + ' '));
}


export function chalkSuccess(message, emoji = '✅') {
  console.log('');
  console.error(emoji + ' ' + chalk.bgGreen.black.bold(' ' + message + ' '));
}
