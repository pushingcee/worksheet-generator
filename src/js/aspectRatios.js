class AspectRatio {
  constructor(ratio, width, height) {
    this.ratio = ratio;
    this.width = width;
    this.height = height;
  }
}

export class AspectRatios {
  constructor() {
    this.ratios = [
      new AspectRatio(1.33333333333, 4, 3),    // 4:3
      new AspectRatio(1.5, 3, 2),              // 3:2
      new AspectRatio(1.77777777778, 16, 9),   // 16:9
      new AspectRatio(1, 1, 1),                // 1:1
      new AspectRatio(2.111111, 19, 9),        // 19:9
      new AspectRatio(2, 18, 9),               // 18:9
      new AspectRatio(0.8, 4, 5),              // 4:5
      new AspectRatio(0.66666666666, 2, 3),    // 2:3
      new AspectRatio(0.5625, 9, 16)           // 9:16
    ];
  }

  getAll() {
    return this.ratios;
  }

  findClosest(ratio) {
    return this.ratios.reduce((closest, current) =>
      Math.abs(current.ratio - ratio) < Math.abs(closest.ratio - ratio)
        ? current
        : closest
    );
  }
}
