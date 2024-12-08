export class GridManager {
  constructor(imageWidth, imageHeight, problemCount) {
    if (!imageWidth || !imageHeight || !problemCount) throw new Error("Invalid input");
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.problemCount = problemCount;
    this.calculateGridDimensions();
    this.calculateSquareStarts();
  }

  calculateGridDimensions() {
    const sqrt = Math.sqrt(this.problemCount);
    if (sqrt % 1 === 0) {
      this.rows = sqrt;
      this.columns = sqrt;
    } else {
      let closestPair = { h: 2, v: this.problemCount / 2 };
      for (let i = 2; i <= sqrt; i++) {
        if (this.problemCount % i === 0) {
          const j = this.problemCount / i;
          if (Math.abs(closestPair.v - closestPair.h) > Math.abs(i - j)) {
            closestPair = { h: i, v: j };
          }
        }
      }
      this.rows = closestPair.h;
      this.columns = closestPair.v;
    }

    this.columnInterval = this.imageWidth / this.columns;
    this.rowInterval = this.imageHeight / this.rows;
  }

  calculateSquareStarts() {
    this.squareStarts = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const x = Math.floor(col * this.columnInterval);
        const y = Math.floor((this.rows - row - 1) * this.rowInterval);
        this.squareStarts.push({ x, y });
      }
    }
  }
}
