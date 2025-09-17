import D from './data';
import Player from './entities/player';
import Key from './entities/key';
import Exit from './entities/exit';
import Dog from './entities/dog';
import Spike from './entities/spike';
import Camera from './entities/camera';
import Loot from './entities/loot';

export function makeLevel(data, opts) {
  data=data.split('-');
  const levelSize = vec2(data[0].length, data.length);
  const pos = vec2();
  const floorLayer = new TileLayer(vec2(), levelSize.scale(.5), new TileInfo(vec2(), vec2(8)), vec2(2));
  const tileLayer = new TileLayer(vec2(), levelSize, new TileInfo(vec2(), vec2(8)));

  initTileCollision(levelSize);
  opts.levelSize = levelSize;

  const cols = 'GBSRBGRB';
  const use = cols[opts.level];
  const col = PAL[use];

  const wall = new TileLayerData(10, 0, false, col[0]),
  wallShadow = new TileLayerData(opts.level > 3 ? 9 : 8, 0, false, col[1]);

  let player, loot = 0;


  for (pos.x = levelSize.x; pos.x--;) {
    for (pos.y = levelSize.y; pos.y--;) {
      let tile = data[pos.y][pos.x];

      floorLayer.setData(pos, new TileLayerData(10, 0, false,
        col[2].scale(1, rand(.75, 1))
      ));

      if (tile !== '1') {
        if (tile === 'K') new Key(pos);
          else if (tile === 'D') new Dog(pos, opts.sfx);
            else if (tile === 'L') { new Loot(pos); loot++; }
            else if (tile === 'P') player = new Player(pos, opts);
              else if (tile === 'E') new Exit(pos);
                else if (tile === 'S') new Spike(pos);
                  else if (tile === 'C') new Camera(pos);
        continue;
      }

      tileLayer.setData(pos, wall);
      setTileCollisionData(pos, 1);
      if (data[pos.y-1] && data[pos.y-1][pos.x] != '1') {
        tileLayer.setData(pos.add(vec2(0, -1)), wallShadow);
      }
    }
  }

  floorLayer.redraw();
  tileLayer.redraw();
  player.levelLoot = loot;
  return player;
}


export function favIcon() {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 8, 8, 0, 0, 8, 8);
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL();
    document.head.appendChild(link);
  };
  img.src = 't.gif';
}

export function niceText( text, x, y, sizeFactor = 1,
  fillColor = '#fff', outlineColor = "rgba(0,0,0,.5)") {

  // Clamp the font size once
  let fontSize = clamp(overlayCanvas.width / 40, 10, 20) * sizeFactor;
  let outlineWidth = fontSize / 5;
  let dShadow = fontSize / 5;

  // Set shared context properties once
  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "middle";
  // overlayContext.font = `${fontSize}px "monospace"`;
  overlayContext.font = `${fontSize}px Slackey`;
  overlayContext.lineWidth = outlineWidth;

  // Draw drop shadow
  overlayContext.globalAlpha = 0.2;
  overlayContext.fillStyle = '#000';
  overlayContext.strokeStyle = outlineColor; // Reuse outline color for shadow outline
  overlayContext.strokeText(text, x + dShadow, y + dShadow);
  overlayContext.fillText(text, x + dShadow, y + dShadow);
  overlayContext.globalAlpha = 1;

  // Draw main text
  overlayContext.fillStyle = fillColor;
  overlayContext.strokeStyle = outlineColor;
  overlayContext.strokeText(text, x, y);
  overlayContext.fillText(text, x, y);
}

export function injectCSS() {
  const muteIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>';
  const mutedIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';

  document.head.innerHTML += `<style>
@font-face {
font-family: Slackey;
src: url(Slackey-Regular.ttf);
}
body{transition:opacity.5s}body.out{opacity:0}body.in{opacity:1}
.hover{cursor: pointer;}
#mute { position: absolute; top: 15px; left: 15px; width: 32px; height: 32px;
background-image: url('data:image/svg+xml,${encodeURIComponent(muteIcon)}');

}
#mute.muted { 
background-image: url('data:image/svg+xml,${encodeURIComponent(mutedIcon)}');
}
#mute:hover { cursor: pointer; }
</style>`;
}

export function createUI(toggleMute, mute) {

  const uiRoot = new UIObject();

  const sound_ui = new Sound([1,0]);
  const w = mainCanvasSize.x,
  h = mainCanvasSize.y;

  // setup example menu
  const uiMenu = new UIObject(vec2(D.width/2,D.height/2), vec2(.5));
  uiRoot.addChild(uiMenu);
  const uiBackground = new UIObject(vec2(-135,0), vec2(D.width-10,D.height-10), WHITE, BLACK);
  uiBackground.lineWidth = 2;
  uiMenu.addChild(uiBackground);

  const textTitle = new UIText(vec2(-135,-180), vec2(200, 45), 'About');
  uiMenu.addChild(textTitle);
  textTitle.textColor = RED;
  textTitle.lineWidth = 4;
  textTitle.lineColor = BLACK;

  const controls = isTouchDevice ? 'Swipe to move' : 'Move with Arrow keys'

  const mainText = new UIText(vec2(-220,-70), vec2(150, 25), 
    `- ${controls}\n- Steal Loot\n- Find the Key\n- Escape`,
    'left')
  uiMenu.addChild(mainText);


  const creditsText1 = new UIText(vec2(-220,170), vec2(150, 25), 
    `by eoinmcg`,
    'left', 'Slackey', GRAY, BLUE)
  uiMenu.addChild(creditsText1);
  creditsText1.onPress = () => {
    window.open('https://github.com/eoinmcg/kleptokitty', '_blank');
  }
  const creditsText2 = new UIText(vec2(-220,200), vec2(150, 25), 
    `made with LittleJS`,
    'left', 'Slackey', GRAY, BLUE)
  uiMenu.addChild(creditsText2);
  creditsText2.onPress = () => {
    window.open('https://github.com/KilledByAPixel/LittleJS', '_blank');
  }

  const handleMute = () => {
    checkbox.checked = toggleMute();
    sound_ui.play(0,.5,checkbox.checked?4:1);
  }

  const checkbox = new UICheckbox(vec2(-170,30), vec2(20));
  uiMenu.addChild(checkbox);
  checkbox.checked = mute;
  checkbox.onPress = () => { handleMute(); }
  const muteText = new UIText(vec2(-140,30), vec2(50, 25),
    `Mute`,
    'left', 'Slackey')
  uiMenu.addChild(muteText);
  muteText.onPress = () => { handleMute(); }

  const button1 = new UIButton(vec2(-135,100), vec2(200,25), 'Map Editor');
  uiMenu.addChild(button1);
  button1.onPress = ()=> {
    window.open('mapeditor.html', '_blank');
    sound_ui.play();
  }

  const exitButton = new UIButton(vec2(-20,-220), vec2(25, 25), 'X');
  uiMenu.addChild(exitButton);
  exitButton.onPress = ()=> {
    sound_ui.play(0,.5,2);
    uiMenu.visible = false;
  }
  uiMenu.visible = false;

  return {uiRoot, uiMenu};

}

