export default class Swiper {
    constructor() {
        if (Swiper.instance) return Swiper.instance;
        Swiper.instance = this;

        document.addEventListener('touchstart', this.start);
        document.addEventListener('touchmove', this.move);
        document.addEventListener('touchend', this.end);
    
        this.clear();
    }
    
    start = (e) => {
        const t = e.touches[0];
        // start x & y
        this.sx = this.lx = t.clientX;
        this.sy = this.ly = t.clientY;
    }
    
    move = (e) => {
        const t = e.touches[0];
        // last x & y
        this.lx = t.clientX;
        this.ly = t.clientY;
    }
    
    end = () => {
        // distance swiped
        const dx = this.sx - this.lx;
        const dy = this.sy - this.ly;

        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        
        this.dir = Math.max(ax, ay) < 20 ? null : 
                   ax > ay ? (dx > 0 ? 'left' : 'right') : 
                   (dy > 0 ? 'up' : 'down');
    }
    
    clear() {
        this.sx = this.sy = this.lx = this.ly = this.dir = null;
    }
}
