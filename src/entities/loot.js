import Sprite from './sprite';

export default class Loot extends Sprite {
  constructor(pos, col) {
    super(pos, vec2(.9, .7), 11);
    this.name='loot';
    // this.color = PAL.LOOT;
    let cols = [.75, 0, .1, .8, .2,.3,.5];
    // this.color = hsl(rand().toFixed(1),1,.6);
    this.color = hsl(cols[~~(Math.random() * cols.length)],1,.6);
    this.startPos = this.pos.copy();
    this.off = vec2(.2);
    this.glimmerSpeed = 2; // Adjust this to control speed (higher = faster)
  }
  update() {
    // Calculate position of glimmer with faster movement
    let sineValue = Math.sin(time * this.glimmerSpeed);
    
    // Check if sine wave is moving in positive direction (derivative > 0)
    // cos(x) gives us the derivative of sin(x)
    let cosValue = Math.cos(time * this.glimmerSpeed);
    
    // Only update offset when moving in positive direction
    if (cosValue > 0) {
      this.off = clamp(sineValue * .5, -.2, .2);
    } else {
      this.off = -1; // Set to invalid value to hide glimmer
    }
    super.update();
  }

  render() {
    super.render();

    drawLine(this.pos.add(vec2(-.5,0)), this.pos.add(vec2(.3,0)), .1, new Color(1,1,1,0.4));

    // Only draw glimmer effect when off >= 0
    if (this.off >= 0) {
      let p = this.pos.add(vec2(this.off));
      drawRect(p, vec2(.2), WHITE);
      if (this.off >= .2) {
        drawLine(p.add(vec2(-.3,0)), p.add(vec2(.3,0)), .1, WHITE);
        drawLine(p.add(vec2(0,-.3)), p.add(vec2(0,.3)), .1, WHITE);
      }
    }
  }
}
