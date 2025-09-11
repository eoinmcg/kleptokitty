// import { makeDebris } from '../effects';
import Sprite from './sprite';

export default class Camera extends Sprite {
  constructor(pos) {
    // super(pos.add(vec2(.5)), vec2(.8), tile(12,8));
    super(pos, vec2(.8), 12);
    this.name = 'camera';
    this.rotationAngle = 0; // Track rotation angle
    this.rotationSpeed = 0.01; // Rotation speed (radians per frame)
  }
  
  update() {
    super.update();
    this.length = 6;
    
    // Update rotation angle
    this.rotationAngle += this.rotationSpeed;

    // Calculate the direction vector using rotation
    const directionX = Math.cos(this.rotationAngle);
    const directionY = Math.sin(this.rotationAngle);
    
    // Calculate the full-length end point
    const fullEndPoint = vec2(
      this.pos.x + directionX * this.length,
      this.pos.y + directionY * this.length
    );
    
    // Check for collision with tile map
    this.hitWall = tileCollisionRaycast(this.pos, fullEndPoint);
    
    let actualLength = this.length;
    if (this.hitWall) {
      // Calculate distance to collision point and pull back slightly
      const collisionDistance = this.pos.distance(this.hitWall);
      actualLength = Math.max(0, collisionDistance - 0.2); // Pull back by 0.1 units
      
    }
    
    // Always use the rotation angle, but with the adjusted length
    this.finalEndPoint = vec2(
      this.pos.x + directionX * actualLength,
      this.pos.y + directionY * actualLength
    );

    if (this.hitWall) {
      // makeDebris(this.finalEndPoint, RED);
    }


    const hits = engineObjectsRaycast(this.pos, this.finalEndPoint);
    for (const o of hits) {
      if (o.name === 'cat' && !o.dead) {
        o.dead = 'zapped';
        break;
      }
    }

  }
  
  render() {
    drawLine(this.pos, this.finalEndPoint, .2, RED);
    if (this.hitWall) drawCircle(this.finalEndPoint, .3, RED);
    super.render();
  }
}
