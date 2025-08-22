import { GridManager } from './gridManager.js';
import { ProblemDivRenderer } from './problemDivRenderer.js';
import { DivRenderer } from './puzzleDivRenderer.js';

export class ScramblerDiv {
  constructor(image, mainContainer, problemContainer, problemCount, answers, questions) {
    if (!image || !mainContainer || !problemContainer || !problemCount) throw new Error("Invalid input");
    this.image = image;
    this.gridManager = new GridManager(image.width, image.height, problemCount);
    this.mainRenderer = new DivRenderer(mainContainer, image);
    this.problemRenderer = new ProblemDivRenderer(problemContainer, this.gridManager);
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
    this.problemRenderer = new ProblemDivRenderer(this.problemRenderer.container, this.gridManager)
    this.squareStarts = [...this.gridManager.squareStarts];
    this.shuffledSquareStarts = [...this.gridManager.squareStarts]; 
  }

  createPuzzleGrid() {
    const {columnInterval, rowInterval } = this.gridManager;
    
    // Create tiles instead of drawing on canvas
    this.mainRenderer.createTiles(this.squareStarts, columnInterval, rowInterval);
    this.mainRenderer.placeAnswersInTiles(this.shuffledSquareStarts, this.answers, rowInterval)
    this.mainRenderer.shuffleTiles(this.squareStarts, columnInterval, rowInterval);
    this.mainRenderer.drawGrid(columnInterval, rowInterval) 
  }
  
}