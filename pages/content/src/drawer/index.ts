export class Drawer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private ws: WebSocket;
  private dpi: number;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.dpi = window.devicePixelRatio;
    this.setupDrawingArea();
  }

  public clean() {
    const canvasEl = document.getElementById('shuffleMeet-canvas-container');
    console.log('Cleaning canvas');
    if (canvasEl) {
      canvasEl.remove();
    }
  }

  private setupDrawingArea() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.0);
        border-radius: 8px;
        overflow: hidden;
        pointer-events: none;
        z-index: 9998;
      `;
    container.id = 'shuffleMeet-canvas-container';

    this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.canvas.id = 'shuffleMeet-canvas';
    this.canvas.style.cursor = 'crosshair';

    this.ctx = this.canvas.getContext('2d')!;
    container.appendChild(this.canvas);
    this.updateCanvasSize();
    document.body.appendChild(container);
    this.setupDrawingEvents();
  }

  private updateCanvasSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * this.dpi;
    this.canvas.height = height * this.dpi;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(this.dpi, this.dpi);
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private setupDrawingEvents() {
    let lastX = 0;
    let lastY = 0;

    const draw = (e: MouseEvent) => {
      if (!this.isDrawing) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const [relX, relY] = this.toRelativeCoordinates(x, y);
      const [relLastX, relLastY] = this.toRelativeCoordinates(lastX, lastY);

      new Line(this.ctx, relLastX, relLastY, relX, relY);

      this.ws.send(
        JSON.stringify({
          draw: {
            fromX: relLastX,
            fromY: relLastY,
            toX: relX,
            toY: relY,
          },
        }),
      );

      [lastX, lastY] = [x, y];
    };

    this.canvas.addEventListener('mousedown', e => {
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
    });

    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', () => (this.isDrawing = false));
    this.canvas.addEventListener('mouseout', () => (this.isDrawing = false));
  }

  private toRelativeCoordinates(x: number, y: number): [number, number] {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return [x / width, y / height];
  }

  private toAbsoluteCoordinates(relX: number, relY: number): [number, number] {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return [relX * width, relY * height];
  }

  public drawRemoteLine(fromX: number, fromY: number, toX: number, toY: number) {
    const [absFromX, absFromY] = this.toAbsoluteCoordinates(fromX, fromY);
    const [absToX, absToY] = this.toAbsoluteCoordinates(toX, toY);
    new Line(this.ctx, absFromX, absFromY, absToX, absToY);
  }
}

class Line {
  private ctx: CanvasRenderingContext2D;
  private fromX: number;
  private fromY: number;
  private toX: number;
  private toY: number;
  private opacity: number = 1;
  private fadeOutDelay: number = 2000; // 2 seconds delay before fade-out

  constructor(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) {
    this.ctx = ctx;
    this.fromX = fromX;
    this.fromY = fromY;
    this.toX = toX;
    this.toY = toY;
    this.draw();
    setTimeout(() => this.clear(), this.fadeOutDelay);
  }

  private draw() {
    console.log('Drawing line');
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.beginPath();
    this.ctx.moveTo(this.fromX, this.fromY);
    this.ctx.lineTo(this.toX, this.toY);
    this.ctx.strokeStyle = `rgba(250, 250, 0, ${this.opacity})`;
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.restore();
  }

  private clear() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.moveTo(this.fromX, this.fromY);
    this.ctx.lineTo(this.toX, this.toY);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.lineWidth = 10;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.ctx.restore();
  }
}
