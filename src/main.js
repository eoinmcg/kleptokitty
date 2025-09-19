import D from './data';
import raw from './data/levels';
import { makeLevel, favIcon, niceText, injectCSS, aboutUI } from './helpers';
import Msg from './entities/msg';
import { musicInit, musicUpdate } from './muzak';
import Button from './entities/button';
import LevelComplete from './entities/levelComplete';

document.title = D.title;
tileFixBleedScale = .5;
const levels = raw.split('+');

injectCSS();

// Create SFX
const sfx = {};
for (const key in D.sfx) sfx[key] = new Sound(D.sfx[key]);

// setGlEnable(true);


// check if level imported via URL string
let startLevel = 0;
let importLevel = location.href.split('?i=')[1];
if (importLevel) {
  console.log('import', importLevel);
    if (importLevel.length > 3) {
      levels.unshift(importLevel);
    } else {
      startLevel = parseInt(importLevel, 10);
      importLevel = false;
  }
}

if (typeof BUILD === 'undefined') {
  setShowWatermark(true);
  console.log('dev version');
} else {
  console.log(`Build: ${BUILD}`);
  setShowWatermark(false);
}

let player, clicked,
    score = 0,
    level = startLevel,
    deaths = 0,
    mute = 0,
    gameOver = 0, ready = false, startTime;

let uiRoot, uiMenu;

const getMenuVisible =()=> uiMenu.visible;
const setMenuVisible =(visible)=> uiMenu.visible = visible;

const updateScore = (val = 10) => score += val;
const setGameOver = (val) => { gameOver = val; deaths += 1; }
const toggleMute = (val = !mute) => {
  mute = val;
  muteButton.className = mute ? 'muted' : '';
  return mute;
}

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
    if (level === 0 && !importLevel) {
      new Msg(isTouchDevice ? 'Swipe to move' : 'ARROWS TO MOVE');
      setTimeout(() => new Msg('Find the Key'), 2500);
      setTimeout(() => new Msg('Grab loot'), 4000);
      setTimeout(() => new Msg('Escape'), 6000);
    } else if (importLevel) {
      new Msg(`Testing`, 3);
    } else {
      new Msg(`Level ${level}`, 3);
    }
    // musicInit(importLevel ? rand(100,200) : level);
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

  initUISystem();
  let ui = aboutUI(toggleMute, mute);
  uiRoot = ui.uiRoot;
  uiMenu = ui.uiMenu;

  if (importLevel || startLevel > 0) {
    startGame();
  }

  new Button(cameraPos.add(vec2(5.5,10.5)), {
    name: 'button', setMenuVisible, sfx
  });
}

function gameUpdate() {

  const showInfo = engineObjects.some(o => o.name === 'info');
  clicked = keyWasPressed('ArrowUp') || gamepadIsDown(2) || (mouseWasPressed(0) && mousePosScreen.y > 50);

  if (keyWasPressed('KeyM')) {
    mute = !mute;
    muteButton.className = mute ? 'muted' : '';
  }
  
  if (!ready && clicked && !showInfo) {
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
  
  const showInfo = engineObjects.some(o => o.name === 'info');
  if (!ready && !showInfo) {
    let x = Math.sin(time*.2)*8;
    drawRect(D.center, vec2(20,30), new Color(.5,.5,1,.3));
    drawTile(D.center.add(vec2(0,-2)), vec2(8), tile(0, 128, 1));
    drawTile(D.center.add(vec2(x,0)), vec2(30), tile(0, 512, 2), new Color(0,.1,.25));



    niceText(D.title, w, h * 0.15, 3.6, '#ff70c5');

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

  // center ui
  uiRoot.pos.x = mainCanvasSize.x/2;

  // menu system
  const menuVisible = getMenuVisible();
  paused = menuVisible;

  // toggle menu visibility
  if (keyWasPressed('KeyI'))
    setMenuVisible(!menuVisible);

  if(gameOver) {
    let a = (gameOver-time)*-.5;
    drawRect(cameraPos, vec2(24), new Color(1,0,0,clamp(a,0,.5)));

  } 
}


engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, D.tiles);

let muteButton = '';
window.setTimeout(() => {

  muteButton = document.createElement('div');
  muteButton.id = 'mute';
  muteButton.addEventListener('pointerdown', () => {
      mute = !mute;
      muteButton.className = mute ? 'muted' : '';
      return false;
  }, false);
  document.body.prepend(muteButton);

}, 1000);

