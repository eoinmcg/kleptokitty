export default class Spike extends EngineObject {
  constructor(pos) {
    super(pos.add(vec2(.5, .2)), vec2(1), tile(5, 8));
    this.name = 'spike';
    this.setCollision();
    this.startPos = this.pos.copy();
    setTimeout(() => {
      this.cat = engineObjects.find(o => o.name === 'cat');
    }, 10);
  }

  update() {
    if (this.cat && this.cat.dead) return;
    this.wave = Math.sin(time);
    this.active = this.wave > 0.5;
    this.size = vec2(1, this.wave);
    this.pos.y = this.startPos.y + (this.wave / 2);
    super.update();
  }

  render() {
    let c = new Color(1,1,1,0.5);
    if (!this.active) {
      drawEllipse(this.startPos.add(vec2(-.25,0)), .25, .1, 0, c);
      drawEllipse(this.startPos.add(vec2(.25,0)), .25, .1, 0, c);
      return;
    }

    super.render();

  }



}
