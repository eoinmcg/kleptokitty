import Sprite from './sprite';

export default class Key extends Sprite {
  constructor(pos) {
    super(pos, vec2(1), 3);
    this.name='key';
    this.setCollision(true, false, false, false);
    this.isSolid = false;
    this.startPos = this.pos.copy();
    this.ttl = 50;
  }

  update() {
    super.update();
    if (this.hasKey) {
      this.tileBelow = true;
      this.velocity = vec2(.5,.4);
      this.ttl -= 1;
      if (this.ttl <= 0) { this.destroy(); }
    } else {
      this.pos.y += Math.sin(time * 3) * 0.005;
    }
  }



}
