import { MathRenderer } from './utils/mathRenderer.js';

export class ProblemRenderer {
  constructor(container, gridManager) {
    if (!container) 
      throw new Error(`Invalid container value: ${container}`);
    if(!gridManager)
      throw new Error(`Invalid grid manager value: ${gridManager}`)

    this.container = container;
    this.gridManager = gridManager;
    
    // Set container dimensions and style
    this.container.style.width = `${this.gridManager.imageWidth}px`;
    this.container.style.height = `${this.gridManager.imageHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.border = '1px solid black';
    this.container.style.backgroundColor = 'white';
  }

  drawGrid() {
    // Clear existing content
    this.container.innerHTML = '';
    
    const { columnInterval, rowInterval, rows, columns } = this.gridManager;

    // Create grid lines using divs
    // Vertical lines
    for (let col = 1; col < columns; col++) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = `${col * columnInterval}px`;
      line.style.top = '0';
      line.style.width = '1px';
      line.style.height = '100%';
      line.style.backgroundColor = 'black';
      line.style.pointerEvents = 'none';
      this.container.appendChild(line);
    }

    // Horizontal lines
    for (let row = 1; row < rows; row++) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = '0';
      line.style.top = `${row * rowInterval}px`;
      line.style.width = '100%';
      line.style.height = '1px';
      line.style.backgroundColor = 'black';
      line.style.pointerEvents = 'none';
      this.container.appendChild(line);
    }
  }

  placeText(labels) {
    const { squareStarts, rowInterval, columnInterval } = this.gridManager;

    squareStarts.forEach(({ x, y }, index) => {
      const label = labels[index] || "";
      
      // Create cell container with flexbox
      const cellDiv = document.createElement('div');
      cellDiv.style.position = 'absolute';
      cellDiv.style.left = `${x}px`;
      cellDiv.style.top = `${y}px`;
      cellDiv.style.width = `${columnInterval}px`;
      cellDiv.style.height = `${rowInterval}px`;
      cellDiv.style.display = 'flex';
      cellDiv.style.alignItems = 'flex-end';
      cellDiv.style.justifyContent = 'center';
      cellDiv.style.pointerEvents = 'none';
      
      // Create text content div
      const textDiv = document.createElement('div');
      textDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
      textDiv.style.padding = '8px';
      textDiv.style.borderRadius = '4px';
      textDiv.style.fontSize = '20px';
      textDiv.style.fontFamily = 'Arial';
      textDiv.style.color = 'black';
      textDiv.style.pointerEvents = 'none';
      
      // Temporary: Always try to render math for debugging
      console.log('Processing label in problemRenderer:', label);
      textDiv.innerHTML = MathRenderer.render(label);
      
      // Original logic (commented for debugging):
      // if (MathRenderer.containsMath(label)) {
      //   textDiv.innerHTML = MathRenderer.render(label);
      // } else {
      //   textDiv.textContent = label;
      // }
      
      cellDiv.appendChild(textDiv);
      this.container.appendChild(cellDiv);
    });
  }
}