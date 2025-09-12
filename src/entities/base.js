export default class BaseObject extends EngineObject {
  constructor(pos, size, t, opts) {
    super(pos, size, t);
    this.turning = false;
    this.chasing = false;
    this.name = 'baddie';
    this.fov = pos.copy();
    this.o = opts;
    this.setCollision();
    this.f = 0;
  }

  update() {
    this.tileBelow = getTileCollisionData(this.pos.add(vec2(0, -1)));
    super.update();
    this.turning = false;
    this.f+=1;
  }

  chase() {
    const target = this.chasing.pos;
    this.velocity.x = target.x >= this.pos.x ? this.speed : -this.speed;
    this.velocity.y = target.y >= this.pos.y ? this.speed : -this.speed;
    this.mirror = this.pos.x >= target.x;
  }

  look() {

    if (this.chasing || this.f < 5) return; // @todo this.f is a last min hack

    this.dist = 8 * (this.mirror ? -1 : 1);
    this.fov = this.pos.add(vec2(this.dist, 0));
    this.seesUntil = tileCollisionRaycast(this.pos, this.fov);
    this.fov = this.seesUntil || this.fov;
    
    const canSee = engineObjectsRaycast(this.pos, this.fov);
    for (const o of canSee) {
      if (o.name === 'cat') {
        this.o.sfx.spotted.play();
        this.chasing = o;
        break;
      }
    }
  }

  drawShadow() {
    if (!this.tileBelow) {
      drawCircle(this.pos.add(vec2(0, -.5)), .5, SHADOW);
    }
  }

  drawTorch(xOff) {
    if (this.f < 5) return;
    const light = new Color(.9, .8, .4, .5);
    const dir = this.mirror ? -1 : 1;
    
    drawLine(this.pos, this.fov.add(vec2(xOff, 0)), .5, light);
    drawTile(this.fov, vec2(dir), tile(7, 8), light);
    // drawTile(this.fov.add(vec2(-dir, 0)), vec2(1), tile(18, 8), light, 0, this.mirror);
  }

  collideWithTile(tileData, pos) {
    if (this.chasing) {
      this.mirror = this.velocity.x <= 0;
      return true;
    }
    
    if (this.turning) return;
    
    this.dir *= -1;
    this.mirror = !this.mirror;
    this.turning = true;
  }
}
