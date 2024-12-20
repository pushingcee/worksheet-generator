export class ProblemGridRenderer {
  constructor(canvas, gridManager) {
    if (!canvas) 
      throw new Error(`Invalid canvas value: ${canvas}`);
    if(!gridManager)
      throw new Error(`Invalid grid manager value: ${gridManager}`)

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gridManager = gridManager;

    this.canvas.width = this.gridManager.imageWidth;
    this.canvas.height = this.gridManager.imageHeight;
  }

  drawGrid() {
    const { columnInterval, rowInterval } = this.gridManager;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1;

    for (let x = columnInterval; x < this.canvas.width; x += columnInterval) {
      this.#drawLine(x, 0, x, this.canvas.height);
    }
    for (let y = rowInterval; y < this.canvas.height; y += rowInterval) {
      this.#drawLine(0, y, this.canvas.width, y);
    }

    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  placeText(labels) {
    const { squareStarts, rowInterval } = this.gridManager;

    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "black";
    squareStarts.forEach(({ x, y }, index) => {
      const label = labels[index] || ""; 
      this.ctx.fillText(
        label,
        x + 10,
        y + rowInterval - 10, 
        this.gridManager.columnInterval - 20 
      );
    });
  }

  #drawLine(xStart, yStart, xEnd, yEnd) {
    this.ctx.beginPath();
    this.ctx.moveTo(xStart, yStart);
    this.ctx.lineTo(xEnd, yEnd);
    this.ctx.stroke();
  }
}
