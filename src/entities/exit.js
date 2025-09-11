export default class Exit extends EngineObject {
  constructor(pos) {
    super(pos.add(vec2(.5)), vec2(1));
    this.name = 'exit';
    this.setCollision();

    setTimeout(() => {
      this.cat = engineObjects.find(o => o.name === 'cat');
    }, 10);

    this.col = new Color(.6, .4, .1);
    
  }

  render() {
    let open = (this.cat && this.cat.hasKey);
    drawRect(this.pos, this.size, BLACK);
    drawRect(this.pos, this.size.scale(.8), open ? YELLOW : this.col);
    if (!open) {
      drawRect(this.pos.add(vec2(-.2, 0)), vec2(.2), BLACK);
    } else {
      drawRect(this.pos, this.size.scale(Math.abs(Math.sin(time * 2))).scale(.8), ORANGE);
    }
  }

}
