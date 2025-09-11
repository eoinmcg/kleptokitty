export default class Sprite extends EngineObject {
  constructor(pos, size, t = 0, opts = {}) {
    super(pos.add(vec2(.5)), size, tile(t, 8));
    this.setCollision();
    this.startPos = this.pos.copy();
    Object.assign(this, opts);
  }

  update() {
    super.update();
    this.tileBelow = getTileCollisionData(this.pos.add(vec2(0, -1)));
  }

  render() {
    if (!this.tileBelow) {
      let x = this.size.x / 2;
      drawEllipse(this.startPos.add(vec2(0, -.5)), x, .2, 0, SHADOW);
    }
    super.render();
  }
}
