import BaseObject from './base';

export default class Dog extends BaseObject {
  constructor(pos, sfx) {
    super(pos.add(vec2(0, .5)), vec2(.9), tile(13, 8), {sfx});
    this.dir = 1;
    this.speed = .1;
  }

  update() {
    if (this.chasing && this.chasing.exited) return;
    this.velocity = vec2(this.speed * this.dir, 0);
    
    if (this.speed) {
      this.tileInfo.pos.x = Math.sin(time * 30) > 0 ? 8 : 16;
    }
    
    if (this.chasing?.pos) {
      this.color = RED;
      this.chase();
    }
    
    this.look();
    super.update();
  }

  render() {
    this.drawShadow();
    //eyes
    drawRect(this.pos.add(vec2(this.mirror ? -.2 : .2, 0.1)), vec2(.6, .3), this.chasing ? BLACK : RED);
    
    if (!this.chasing && this.fov) {
      const xOff = this.mirror ? .5 : -.5;
      this.drawTorch(xOff);
    }
    
    super.render();
  }

  collideWithObject(o) {
    if (o.name === 'loot') return false;
  }

}
