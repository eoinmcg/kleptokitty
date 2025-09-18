import Pointer from './pointer';

export default class Button extends EngineObject {

  constructor(pos, opts) {
    let size = vec2(1);
    super(pos, size, tile(15,8));
    Object.assign(this, opts);
    this.name = opts.name;
    this.hover = false;
    this.color = 'WHITE';
    this.hoverColor = new Color(0,0,0);
    this.setCollision(true);


    const pointerExists = engineObjects.some(o => o.name === 'pointer');
    if (!pointerExists) {
      new Pointer();
    }
  }

  update() {
    this.color = this.hover ? this.hoverColor : WHITE;
    if (this.hover && !this.wasHover) {
      document.body.classList.add('hover');
    } else if (this.wasHover && !this.hover) {
      document.body.classList.remove('hover');
    }
    if (mouseWasPressed(0) && this.hover) {
      this.sfx.ui.play();
      this.setMenuVisible(true);
    }
    this.wasHover = this.hover;
    this.hover = false;
    super.update();
  }

  render() {
    // drawText('INFO', this.pos.add(vec2(-2,0)));
    // drawRect(this.pos, this.size.add(vec2(.2)));
    const o = this.hover ? .9 : .2;
    drawTile(this.pos, vec2(1.3), tile(7,8), new Color(1,1,1,o))
    super.render();
  }

  collideWithObject(o) {
    this.hover = true;
  }

}
