import { GridManager } from './gridManager';
import { ProblemGridRenderer } from './problemCanvasRenderer';
import { CanvasRenderer } from './puzzleCanvasRenderer';

export class Scrambler {
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
    this.createPuzzleGrid()
    this.problemRenderer.drawGrid()
    this.problemRenderer.placeText(this.questions)
  }


  createPuzzleGrid() {
    const {columnInterval, rowInterval } = this.gridManager;
    this.mainRenderer.drawImage(columnInterval, rowInterval);
    this.mainRenderer.placeAnswersInTiles(this.shuffledSquareStarts, this.answers, rowInterval)
    this.mainRenderer.shuffleTiles(this.squareStarts, columnInterval, rowInterval);
    this.mainRenderer.drawGrid(columnInterval, rowInterval) 
  }
  
}
