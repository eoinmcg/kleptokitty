import D from './data';
// import testLevel from './data/testlevel';
import raw from './data/levels';
import { makeLevel, favIcon, niceText } from './helpers';
import Msg from './entities/msg';
import { musicInit, musicUpdate } from './muzak';
import Intro from './entities/intro';
import LevelComplete from './entities/levelComplete';

document.title = D.title;
tileFixBleedScale = .5;
const levels = raw.split('+');

document.head.innerHTML += `<style>body{transition:opacity.5s}body.out{opacity:0}body.in{opacity:1}</style>`;

// Create SFX
const sfx = {};
for (const key in D.sfx) sfx[key] = new Sound(D.sfx[key]);

// setGlEnable(true);

let player, clicked,
    score = 0,
    level = parseInt(location.search.split('=').pop(), 10) - 1 || 0,
    // level = 0,
    deaths = 0,
    mute = 0,
    gameOver = 0, ready = false, startTime;

const updateScore = (val = 10) => score += val;
const setGameOver = (val) => { gameOver = val; deaths += 1; }

const nextLevel = () => {
  level += 1;
  let complete = level >= levels.length;

  const { moves, loot, pos, levelLoot } = player;
  engineObjects.forEach(o => o.destroy());
  let t = time - startTime;
    startTime = time;
  new LevelComplete({ pos, updateScore, complete, score, level, startGame, sfx, moves, loot, levelLoot, t, deaths });
}

const startGame = () => {
  document.body.className = 'out';
  setTimeout(() => {
    engineObjects.forEach(o => o.destroy());
    document.body.className = 'in';
    gameOver = 0;
    ready = true;
    player = makeLevel(levels[level], { setGameOver, updateScore, nextLevel, sfx, level });
    startTime = time;
    if (level === 0) {
      new Msg(isTouchDevice ? 'Swipe to move' : 'ARROWS TO MOVE');
      setTimeout(() => new Msg('Find the Key'), 2500);
      setTimeout(() => new Msg('Grab loot'), 4000);
      setTimeout(() => new Msg('Escape'), 6000);
    } else {
      new Msg(`Level ${level}`, 3);
    }
    musicInit(level);
  }, 500);
};

function gameInit() {
  window.D = D;
  D.size = vec2(D.width / D.tileSize, D.height / D.tileSize);
  D.center = vec2(D.size.x / 2, D.size.y / 2);
  D.OC = overlayCanvas;

  document.body.style.backgroundColor = '#333';
  favIcon();

  const gameSize = vec2(D.width, D.height);
  setCanvasFixedSize(gameSize);
  setCanvasMaxSize(gameSize);

  cameraPos = D.center;
  cameraScale = 20;
  objectDefaultDamping = .7;
  // startGame();
}

function gameUpdate() {
  clicked = keyWasPressed('ArrowUp') || mouseWasPressed(0);

  if (keyWasPressed('KeyM')) mute = !mute
  
  if (!ready && clicked) {
    ready = true;
    startGame();
    // new Intro({startGame});
  }

  if (!mute && player && !player.exited && !player.dead) {
    musicUpdate(player);
  }
  
  if (player?.dead && !gameOver) setGameOver(time);
  
  if (gameOver && clicked && time > gameOver + 1) {
    startGame();
  }
}

function gameUpdatePost() {}

function gameRender() {
  const flash = Math.sin(time * 5) > 0,
        w = D.OC.width/2, h = D.OC.height;


  let c = new Color(0,.2,.3);
  
  if (!ready) {
    let x = Math.sin(time*.2)*8;
    drawRect(vec2(D.center), vec2(20,30), c, 0, false);
    drawCircle(D.center.add(vec2(x, 0)), 4, WHITE);

    drawTile(vec2(D.center).add(vec2(0,-3)), vec2(4), tile(2, 8), c);
    niceText(D.title, w, h * 0.15, 3);

    if (flash) {
      niceText(isTouchDevice ? 'TAP ME' : 'PRESS ↑ or W', w, h - 50, 2, YELLOW);
    }
  }
  
  if (player && !player.exited && !player.dead) {
    let t = 30 - ~~(time - startTime);
    if (t < 0) {
      if (!gameOver) {
        player.dead = 'time up';
        setGameOver(); 
      }
      t = 0;
    }
    niceText(t, w*2 - 50, 30, 3, '#fff');
  }
  
  if (gameOver && flash) {
    niceText(player.dead, overlayCanvas.width / 2, overlayCanvas.height / 2, 3, WHITE);
  }

  
  // drawTextOverlay('??', cameraPos.copy().add(vec2(0,-11)), 1, RED);
}

function gameRenderPost() {
  if(gameOver) {
    let a = (gameOver-time)*-.5;
    drawRect(cameraPos, vec2(24), new Color(1,0,0,clamp(a,0,.5)));

  } 
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, D.tiles);
