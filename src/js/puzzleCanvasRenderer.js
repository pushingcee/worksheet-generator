export class CanvasRenderer {
  constructor(canvas, image) {
    if (!canvas || !image) throw new Error("Invalid input");
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.image = image;

    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.font = "25px Arial";
  }

  drawImage() {
    this.clearCanvas();
    this.ctx.drawImage(this.image, 0, 0);
  }

  placeAnswersInTiles(squareStarts, answers, rowInterval) {
    this.ctx.save();
  
    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = "white";
  
    squareStarts.forEach(({ x, y }) => {
      const boxHeight = 50;
      this.ctx.fillRect(x, y + rowInterval - boxHeight, 150, boxHeight);
    });
    this.ctx.restore();
  
    squareStarts.forEach(({ x, y }, index) => {
      this.ctx.fillText(answers[index], x + 5, y + rowInterval - 5, 150);
    });
  
  }
  

  shuffleTiles(squareStarts, columnInterval, rowInterval) {
    for (let i = squareStarts.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      this.#swapTiles(squareStarts, i, j, columnInterval, rowInterval);
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(columnInterval, rowInterval) {
    for (let x = columnInterval; x < this.canvas.width; x += columnInterval) {
      this.#drawLine(x, 0, x, this.canvas.height);
    }
    for (let y = rowInterval; y < this.canvas.height; y += rowInterval) {
      this.#drawLine(0, y, this.canvas.width, y);
    }
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  #drawLine(xStart, yStart, xEnd, yEnd) {
    this.ctx.beginPath();
    this.ctx.moveTo(xStart, yStart);
    this.ctx.lineTo(xEnd, yEnd);
    this.ctx.stroke();
  }

  #swapTiles(squareStarts, firstIndex, secondIndex, columnInterval, rowInterval) {
    const { x: x1, y: y1 } = squareStarts[firstIndex];
    const { x: x2, y: y2 } = squareStarts[secondIndex];

    const firstTile = this.ctx.getImageData(x1, y1, columnInterval, rowInterval);
    const secondTile = this.ctx.getImageData(x2, y2, columnInterval, rowInterval);

    this.ctx.putImageData(secondTile, x1, y1);
    this.ctx.putImageData(firstTile, x2, y2);

    [squareStarts[firstIndex], squareStarts[secondIndex]] = [squareStarts[secondIndex], squareStarts[firstIndex]];
  }
}
