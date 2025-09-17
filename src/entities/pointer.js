export default class Pointer extends EngineObject {

  constructor() {
    super(vec2(), vec2(.1));
    this.setCollision();
    this.name='pointer';
  }

  update() {
    this.pos = mousePos.copy();
    super.update();
  }

  render() {
    //drawRect(this.pos, this.size, GREEN);
  }

}
