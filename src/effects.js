export function smoke(pos, force = 2) {
	// smoke
	new ParticleEmitter(
		pos, // pos
		0, // angle
		0, // 0.1 * force, // radius / 2, // emitSize
		0.1, // emitTime
		rand(15, 30) * (force + 0.2), // emitRate
		PI / 2, // emiteCone
		tile(7,8),
		rgb(1, 1, 1, .15),
		rgb(0.5, 0.5, 0.5, 0.15),
		rgb(1, 1, 1, .15),
		rgb(1, 1, 1, .15),
		0.4, // time
		0.5 + 0.1 * force, // sizeStart
		0.1, // sizeEnd
		force * 0.001, // speed
		0.1, // angleSpeed
		0.8, // damp
		0.9, // angleDamp
		-0.2, // gravity
		PI, // particle cone
		0.5, // fade
		1, // randomness
		false, // collide
		!isTouchDevice, // additive
		true, // colorLinear
		0 // renderOrder
	);
}


  export function sparks(p, t, c = YELLOW) {
      new ParticleEmitter(
          p, 0,            // pos, angle
          0, .2, 30, 1, // emitSize, emitTime, emitRate, emiteCone
          tile(t,8),                      // tileInfo
          c, c,           // colorStartA, colorStartB
          c.scale(1, 0), c.scale(1, 0), // colorEndA, colorEndB
          1, .3, .6, .1, 0.005,  // time, sizeStart, sizeEnd, speed, angleSpeed
          1, 1, 0.05, PI,   // damping, angleDamping, gravityScale, cone
          0, 0, 0, 0        // fadeRate, randomness, collide, additive
      );
  }

