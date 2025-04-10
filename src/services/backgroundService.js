import * as THREE from "three";
import BIRDS from "vanta/src/vanta.birds";

export default {
  vantaEffect: null,

  initVantaEffect(el) {
    if (this.vantaEffect) {
      this.destroyVantaEffect();
    }

    this.vantaEffect = BIRDS({
      el,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 0.8,
      backgroundColor: 0xf5f5f7,
      color1: 0x0066cc,
      color2: 0x5856d6,
      colorMode: "variance",
      birdSize: 1.0,
      wingSpan: 12.0,
      speedLimit: 2.0,
      separation: 35.0,
      alignment: 25.0,
      cohesion: 25.0,
      quantity: 3.0
    });
  },

  destroyVantaEffect() {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
      this.vantaEffect = null;
    }
  }
};