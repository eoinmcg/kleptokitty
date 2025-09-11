import fs from 'node:fs';
import { chalkError } from './helpers.js';

const hasGit = fs.existsSync('.git');


if (!hasGit) {
  chalkError('This script must be run in a Git repository.\n');
  console.log('Please check the docs for further info');
  console.log('');
  process.exit(1);
}
