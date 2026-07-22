export class Particle {
  x = 0;
  y = 0;
  size = 0;
  speedX = 0;
  speedY = 0;
  opacity = 0;

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {
    this.reset();
    this.y = Math.random() * height;
  }

  reset(): void {
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height * 2 + this.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 3 + 1;
    this.speedY = Math.random() * -1 - 0.5;
    this.opacity = Math.random() * 0.7 + 0.3;
  }

  update(): void {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > this.width || this.y < 0) {
      this.x = -10;
      this.y = Math.random() * this.height;
    }
  }

  draw(ctx: CanvasRenderingContext2D, sandRgb: string, nightFactor: number, height: number): void {
    let finalOpacity = this.opacity;
    const fadeStart = height * 0.75;
    if (this.y > fadeStart) {
      const depth = (this.y - fadeStart) / (height - fadeStart);
      const minVisibility = 0.15 * (1 - nightFactor);
      finalOpacity *= Math.max(minVisibility, 1 - depth * 2);
    }
    ctx.fillStyle = `rgba(${sandRgb}, ${finalOpacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
