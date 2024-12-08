import { GridManager } from './GridManager';
import { ProblemGridRenderer } from './ProblemGridRenderer';
import { CanvasRenderer } from './CanvasRenderer';

export class ScramblerSR {
  constructor(image, mainCanvas, problemCanvas, problemCount, answers, questions) {
    if (!image || !mainCanvas || !problemCanvas || !problemCount) throw new Error("Invalid input");
    this.image = image;
    this.gridManager = new GridManager(image.width, image.height, problemCount);
    this.mainRenderer = new CanvasRenderer(mainCanvas, image);
    this.problemRenderer = new ProblemGridRenderer(problemCanvas, this.gridManager);
    this.answers = answers;
    this.questions = questions;
    this.squareStarts = [...this.gridManager.squareStarts];
    this.shuffledSquareStarts = [...this.gridManager.squareStarts]; 
  }

  initialize() {
    const { columnInterval, rowInterval } = this.gridManager;
    this.mainRenderer.drawImageGrid(columnInterval, rowInterval);
    this.shuffle()
    this.problemRenderer.drawGrid()
    this.problemRenderer.placeText(this.questions)
  }

  placeAnswers() {
    const {rowInterval } = this.gridManager;
    this.mainRenderer.placeAnswersInTiles(this.shuffledSquareStarts, this.answers, rowInterval);
  }

  shuffle() {
    const {columnInterval, rowInterval } = this.gridManager;
    this.mainRenderer.shuffleTiles(this.shuffledSquareStarts, columnInterval, rowInterval);
  }
  
}
