/**
 * Data - Game configuration and assets.
 * This file contains global game data, including game
 * dimensions, asset paths, and sound effect definitions.
 */
const Data = {
  title: 'KleptoKitty', // this will be injected into document.title
  width: 270, height: 480, // mobile portratit
  tiles: ['t.gif', 'mugshot.png', 'spotlight.png'], // tiles are located in public/
  tileSize: 8,
  sfx: { // create effects here: https://killedbyapixel.github.io/ZzFX/
    click: [1,.5],
    siren: [,0,960,,1,.01,,.8,-0.01,,-190,.5,,.05,,,1],
    pickup: [,,491,.01,.06,.07,1,2.7,,,419,.09,,,,,,.65,.02,,257],
    hit: [2.4,,51,.02,.1,.12,2,1.6,,,,,.01,2,,.2,.11,.74,.08,.28],
    key: [.8,,444,.09,.24,.35,,3.7,,,81,.09,.03,,,,,.54,.23,.29,211],
    open: [1.1,,250,.07,.24,.26,,2,,164,211,.07,.08,,,.1,,.75,.12,.09,115],
    spotted: [,.1,75,.03,.08,.17,1,1.88,7.83,,,,,.4],
    ui: [1,0],
  },
}

export default Data;
