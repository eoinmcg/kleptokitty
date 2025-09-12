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
    // overlayContext.font = `${fontSize}px "Slackey"`;
    overlayContext.font = `${fontSize}px monospace`;
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
