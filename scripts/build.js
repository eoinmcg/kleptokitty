#!/usr/bin/env node

import Data from '../src/data.js';
import levels from '../src/data/levels.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';
import fs from 'node:fs';
import child_process from 'node:child_process';
import chalk from 'chalk';
import { chalkError, chalkSuccess } from './helpers.js';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to the project root (parent of scripts directory)
process.chdir(join(__dirname, '..'));

/** 
 * LittleJS Build System
 */

'use strict';

const PROGRAM_NAME = 'game';
const BUILD_FOLDER = 'tmp';
const sourceFiles = [
    'public/littlejs.release.js',
    'dist/game.js',
    'public/globals.js',
  ];

if (!fs.existsSync('dist')) {
  console.error('Error: "dist" directory does not exist. Please run `npm run build`.');
  process.exit(1);
};

// tile(s) extracted from ./src/data.js
const dataFiles = Data.tiles.map(tile => `public/${tile}`);

dataFiles.push('public/Slackey-Regular.ttf');
dataFiles.push('public/mapeditor.html');
dataFiles.push('public/postmortem.html');

console.log(``);
chalkSuccess(` Building ${Data.title}... `, '🛠️');
console.log(``);
const startTime = Date.now();


// remove old files and setup build folder
fs.rmSync(BUILD_FOLDER, { recursive: true, force: true });
fs.rmSync(`${PROGRAM_NAME}.zip`, { force: true });
fs.mkdirSync(BUILD_FOLDER);

// copy data files
for(const file of dataFiles) 
fs.copyFileSync(file, `${BUILD_FOLDER}/${file.split('/').pop()}`);

// fs.unlinkSync(`${BUILD_FOLDER}/levels.txt`);
fs.writeFileSync(`${BUILD_FOLDER}/levels.txt`, levels);

let mapeditor = fs.readFileSync(`${BUILD_FOLDER}/mapeditor.html`, 'utf8');
mapeditor = mapeditor.replace('</head>', '<script>window.BUILD=true</script></head>');
fs.writeFileSync(`${BUILD_FOLDER}/mapeditor.html`, mapeditor);

fs.cpSync('public/map', `${BUILD_FOLDER}/map`, {recursive: true});

Build
  (
    `${BUILD_FOLDER}/index.js`,
    sourceFiles,
    [closureCompilerStep, uglifyBuildStep, roadrollerBuildStep, htmlBuildStep, zipBuildStep]
    //[closureCompilerSimpleStep, htmlBuildStep] // for build debugging
  );

const size = fs.statSync(`${PROGRAM_NAME}.zip`).size;
const MAX = 13312;
const remaining = MAX - size;

console.log(``);
console.log(chalk.blue(`- Build Completed in ${((Date.now() - startTime)/1e3).toFixed(2)} seconds!`));
console.log(chalk.blue(`- Size of ${PROGRAM_NAME}.zip: ${size} bytes`));

if (size < MAX) {
  chalkSuccess(`Remaining space: ${remaining} bytes`);
} else {
  chalkError(`Error: Build size exceeds maximum of ${MAX} bytes!`);
}
console.log('');

///////////////////////////////////////////////////////////////////////////////

// A single build with its own source files, build steps, and output file
// - each build step is a callback that accepts a single filename
function Build(outputFile, files=[], buildSteps=[])
{
  // copy files into a buffer
  let buffer = '';
  for (const file of files)
  buffer += fs.readFileSync(file) + '\n';

  // output file
  fs.writeFileSync(outputFile, buffer, {flag: 'w+'});

  // execute build steps in order
  for (const buildStep of buildSteps)
  buildStep(outputFile);
}

function closureCompilerStep(filename)
{
  console.log(`Running closure compiler...`);

  const filenameTemp = filename + '.tmp';
  fs.copyFileSync(filename, filenameTemp);
  child_process.execSync(`npx google-closure-compiler --js=${filenameTemp} --js_output_file=${filename} --compilation_level=ADVANCED --warning_level=VERBOSE --jscomp_off=* --assume_function_wrapper`, {stdio: 'inherit'});
  fs.rmSync(filenameTemp);
};

function closureCompilerSimpleStep(filename)
{
  console.log(`Running closure compiler in simple mode...`);

  const filenameTemp = filename + '.tmp';
  fs.copyFileSync(filename, filenameTemp);
  child_process.execSync(`npx google-closure-compiler --js=${filenameTemp} --js_output_file=${filename} --compilation_level=SIMPLE --warning_level=VERBOSE --jscomp_off=* --assume_function_wrapper`, {stdio: 'inherit'});
  fs.rmSync(filenameTemp);
};

function uglifyBuildStep(filename)
{
  console.log(`Running uglify...`);
  // child_process.execSync(`npx terser ${filename} -c -m -o ${filename}`, {stdio: 'inherit'});
  child_process.execSync(`npx uglifyjs ${filename} -c -m reserved=[SHADOW,PAL,importLevel] -o ${filename}`, {stdio: 'inherit'});
};

function roadrollerBuildStep(filename)
{
  console.log(`Running roadroller...`);
  child_process.execSync(`npx roadroller ${filename} -o ${filename}`, {stdio: 'inherit'});
};

function roadrollerExtremeBuildStep(filename)
{
  // this takes over a minute to run but might be a little smaller
  console.log(`Running roadroller extreme...`);
  child_process.execSync(`npx roadroller ${filename} -o ${filename} --optimize 2`, {stdio: 'inherit'});
};

function htmlBuildStep(filename)
{
  console.log(`Building html...`);

  // create html file
  let buffer = '';
  buffer += '<body>';
  buffer += '<script>';
  buffer += 'window.BUILD=true;';
  buffer += fs.readFileSync(filename);
  buffer += '</script>';

  // output html	 file
  fs.writeFileSync(`${BUILD_FOLDER}/index.html`, buffer, {flag: 'w+'});
};

function zipBuildStep()
{
  console.log(`Zipping...`);
  const { execSync, spawnSync } = child_process;
  const fileNames = Data.tiles;

	
  if (process.platform === 'win32') {
    // Windows version using ect
    const ect = '../node_modules/ect-bin/vendor/win32/ect.exe';
    const args = ['-9', '-strip', '-zip', `../${PROGRAM_NAME}.zip`, 'index.html', ...fileNames];
    spawnSync(ect, args, {stdio: 'inherit', cwd: BUILD_FOLDER});
  } else {
    // Linux/macOS version using zip
    const zipCommand = `cd ${BUILD_FOLDER} && zip -9 -r ../${PROGRAM_NAME}.zip index.html ${fileNames.join(' ')}`;
    execSync(zipCommand, {stdio: 'inherit'});
  }

  // cleanup - remove tmp and rename to dist for gh-pages
  fs.rmSync('dist', { recursive: true, force: true });
  fs.renameSync('tmp', 'dist')
}


function zipWithArchiver() {

  const fileNames = Data.tiles;

  const output = fs.createWriteStream(path.resolve(BUILD_FOLDER, '..', `${PROGRAM_NAME}.zip`));
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => console.log('Zip created successfully'));
  archive.on('error', err => { throw new Error(`Archiver error: ${err.message}`); });

  archive.pipe(output);
  archive.file(path.join(BUILD_FOLDER, 'index.html'), { name: 'index.html' });
  fileNames.forEach(file => archive.file(path.join(BUILD_FOLDER, file), { name: file }));
  archive.finalize();
}
