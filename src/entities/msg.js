import { niceText } from '../helpers';

export default class Msg extends EngineObject {

  constructor(text, size = 2, duration = 200) {
    super();
    this.pos = vec2(160, 280);
    this.text = text;
    this.duration = duration;
    this.size = size;
  }

  update() {

    this.duration -= time;
    if (this.duration <= 0) {
      this.pos = this.pos.add(vec2(0,-5));
    }
    if (this.pos.y < -50) this.destroy();
  }


  render() {
    niceText(this.text, this.pos.x, this.pos.y, this.size)
  }

}
