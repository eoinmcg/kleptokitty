export default class Intro extends EngineObject {

  constructor(o) {
    super();
    Object.assign(this, o);
    this.startTime = time;
    this.t = '';
    this.text = "If a black cat\n crosses your path,\n count your diamonds,\n for they may\n vanish by dawn";
    this.add();
  }

  add() {
      this.t += this.text[this.t.length];
      if (this.t !== this.text) {
        setTimeout(() => this.add(), 75)
      }
  }

  update() {
    const t = (time - this.startTime);
    if (t > 8) {
      this.startGame();
      this.destroy();
    }
  }

  render() {
    const t = time - this.startTime;
    drawRect(this.pos, vec2(20,20), BLACK);
    drawTextOverlay(this.t, cameraPos, .8, BLACK, .2, YELLOW)
  }
}
