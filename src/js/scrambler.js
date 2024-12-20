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

  adjustForProblemCount(problemCount){
    this.gridManager = new GridManager(this.image.width, this.image.height, Number(problemCount))
    this.problemRenderer = new ProblemGridRenderer(this.problemRenderer.canvas, this.gridManager)
    this.squareStarts = [...this.gridManager.squareStarts];
    this.shuffledSquareStarts = [...this.gridManager.squareStarts]; 
  }

  createPuzzleGrid() {
    const {columnInterval, rowInterval } = this.gridManager;
    this.mainRenderer.drawImage(columnInterval, rowInterval);
    this.mainRenderer.placeAnswersInTiles(this.shuffledSquareStarts, this.answers, rowInterval)
    this.mainRenderer.shuffleTiles(this.squareStarts, columnInterval, rowInterval);
    this.mainRenderer.drawGrid(columnInterval, rowInterval) 
  }
  
}
