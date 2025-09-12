import { niceText } from '../helpers';
export default class LevelComplete extends EngineObject {

  constructor(o) {
    super();
    Object.assign(this, o);
    this.startTime = time;
    this.s = [];
    this.w = 1;
    this.lootPer = ~~(o.loot/o.levelLoot*100)
  }

  update() {
    const t = (time - this.startTime);
    if (t > 6 && !this.complete) {
      this.startGame();
      this.destroy();
    }
  }

  render() {

    const t = time - this.startTime;
    this.w += t*5;
    drawRect(this.pos, vec2(this.w).scale(2), ORANGE, t/2);
    drawRect(this.pos, vec2(this.w), this.complete ? RED : YELLOW, t);

    const bang = (n) => {
      if (this.s.length < n) {
        this.s.push(n);
        this.sfx.hit.play();
      }
    }

    let x = mainCanvasSize.x / 2;
    if (t > 0.5) {
      bang(1);
      niceText(this.complete ? 'VICTORY!' : 'LEVEL COMPLETE', x, 50, 2.7);
    }

    if (t > 2) {
      bang(2);
      niceText(`TIME:  ${~~(this.t)}s`,  x, 200, 2.25);
    }
    if (t > 3) {
      bang(3);
      niceText(`LOOT:  ${this.lootPer}%`, x, 250, 2.25);
    }
    if (t > 4) {
      bang(4);
      niceText('MOVES: ' + this.moves, x, 300, 2.25);
    }
    if (t > 6 && this.complete) {
      niceText('SCORE: ' + this.score, x, 375, 3);
      niceText('DEATHS: ' + this.deaths, x, 425, 2.25);
    }
  }
}
