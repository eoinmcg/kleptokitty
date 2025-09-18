import Sprite from './sprite';
import { smoke, sparks } from '../effects';
import D from '../data';
import Swiper from '../swiper';

export default class Player extends Sprite {
  constructor(pos, opts) {
    super(pos, vec2(.5), 4, opts);
    this.name = 'cat';
    this.speed = .5;
    this.dir = vec2(0, 0);
    this.distance = 0;
    this.moves = 0;
    this.loot = 0;
    this.exited = false;
    // Object.assign(this, opts);
    this.swipe = new Swiper();
    this.renderOrder = 10;
  }

  update() {
    if (this.dead) return;
    let moving = this.velocity.x + this.velocity.y !== 0;
    const d = this.swipe.dir;

    const oldDir = this.dir.copy();
    if (!moving && (!this.dir.x || !this.dir.y)) {
      let gamepad = gamepadStick(0);
      if (gamepad.x > 0 || keyWasPressed('ArrowRight') || d == 'right') this.dir = vec2(1, 0);
      else if (gamepad.x < 0 || keyWasPressed('ArrowLeft') || d == 'left') this.dir = vec2(-1, 0);
      else if (gamepad.y > 0 || keyWasPressed('ArrowUp') || d == 'up') this.dir = vec2(0, 1);
      else if (gamepad.y < 0 || keyWasPressed('ArrowDown') || d == 'down') this.dir = vec2(0, -1);
    }
    if (oldDir.x !== this.dir.x || oldDir.y !== this.dir.y) {
      this.moves += 1;
    }

    this.distance = moving ? this.distance + 1 : 0;
    this.velocity = this.exited ? vec2() : this.dir.scale(this.speed);

    if (moving && !(~~(time * 1000) % 100)) {
      this.sfx.click.play();
      smoke(this.pos.add(vec2(0, -.25)), 0.5);
    }

    this.mirror = this.velocity.x < 0;
    super.update();

    if (this.wasMoving && !moving) {
      this.pos.x = (this.pos.x - ~~(this.pos.x) !== 0.5)
        ? ~~(this.pos.x) + 0.5 : this.pos.x;
    }


      let minW = (D.width / cameraScale)/2,
          minH = (D.height / cameraScale)/2;

      let maxW = this.levelSize.x - minW,
          maxH = this.levelSize.y - minH;

      if  (this.levelSize.y < D.height/cameraScale) {
          minH = (minH + maxH) /2;
          maxH = minH;
      }
      if  (this.levelSize.x < D.width/cameraScale) {
          minW = (minW + maxW) /2;
          maxW = minW;
      }

      cameraPos = vec2(
        clamp(this.pos.x, minW, maxW),
        clamp(this.pos.y, minH, maxH)
      );

    this.wasMoving = moving;


  }

  render() {
    if (this.exited) return;
    if (this.dead) {
      drawTile(this.pos, vec2(1.2), tile(2, 8), BLACK, Math.PI/2);
      return;
    }

    const moving = this.velocity.x + this.velocity.y !== 0;
    
    if (moving) {
      let offset = this.velocity.y !== 0 ? vec2(.3,0) : vec2(0,.3)
      drawLine(this.pos, this.pos.add(this.velocity.scale(-this.distance * .4)), .2, SHADOW);
      drawLine(this.pos.add(offset), this.pos.add(this.velocity.scale(-this.distance * .2)).add(offset), .2, SHADOW);
    }
    
    if (!getTileCollisionData(this.pos.add(vec2(0, -1)))) {
      drawCircle(this.pos.add(vec2(0, -.35)), .45, SHADOW);
    }
    
    const frame = !this.dead && moving && Math.sin(time * 50) > 0 ? 1 : 0;

    drawRect(this.pos.add(vec2(this.mirror ? -.2 : .2, 0.2)), vec2(.6, .2), WHITE);
    drawTile(this.pos.add(vec2(0, .2)), vec2(1), tile(frame, 8), undefined, 0, this.mirror);

    if (this.lockedOut) {
      drawTextOverlay('LOCKED', cameraPos.add(vec2(0,2)), 1, RED, .3, WHITE, 'center', 'Slackey');
    }
    this.lockedOut = false;

  }

  collideWithObject(o) {
    const { name } = o;
    if (this.dead) return false;
    
    if (name === 'key' && !this.hasKey) {
      this.hasKey = true;
      o.hasKey = true
      this.sfx.key.play(this.pos);
      return true;
    }
    
    if (name === 'loot') {
      sparks(o.pos, 6, o.color);
      this.updateScore(10);
      this.loot += 1;
      o.destroy();
      this.sfx.pickup.play(this.pos);
      return false;
    }
    
    if (name === 'baddie') {
      // this.destroy();
      o.speed = 0;
      this.sfx.hit.play(this.pos);
      this.sfx.siren.play(this.pos);
      this.dead = 'Caught';
      return true;
    }

    if (name === 'spike' && o.active) {
      this.dead = 'Spiked';
      this.sfx.hit.play(this.pos);
    }
    
    if (name === 'exit' && !this.exited) {
      if (!this.hasKey) {
        this.lockedOut = true;
        return false;
      }
      this.exited = true;
      this.sfx.open.play(this.pos);
      window.setTimeout(() => {
        this.nextLevel();
      }, 250);
      return false;
    }

    return false;
  }

}
