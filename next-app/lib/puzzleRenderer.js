import { MathRenderer } from './utils/mathRenderer.js';

export class PuzzleRenderer {
  constructor(container, image) {
    if (!container || !image) throw new Error("Invalid input");
    this.container = container;
    this.image = image;
    this.tiles = [];

    // Set container dimensions and style
    this.container.style.width = `${image.width}px`;
    this.container.style.height = `${image.height}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.border = '1px solid black';
  }

  drawImage() {
    this.clearContainer();
    
    // Create a single background image div
    const imageDiv = document.createElement('div');
    imageDiv.style.position = 'absolute';
    imageDiv.style.top = '0';
    imageDiv.style.left = '0';
    imageDiv.style.width = '100%';
    imageDiv.style.height = '100%';
    imageDiv.style.backgroundImage = `url(${this.image.src})`;
    imageDiv.style.backgroundSize = `${this.image.width}px ${this.image.height}px`;
    imageDiv.style.backgroundRepeat = 'no-repeat';
    imageDiv.style.backgroundPosition = '0 0';
    
    this.container.appendChild(imageDiv);
  }

  createTiles(squareStarts, columnInterval, rowInterval) {
    this.clearContainer();
    this.tiles = [];

    squareStarts.forEach(({ x, y }, index) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.index = index;
      tile.dataset.originalX = x;
      tile.dataset.originalY = y;
      
      tile.style.position = 'absolute';
      tile.style.left = `${x}px`;
      tile.style.top = `${y}px`;
      tile.style.width = `${columnInterval}px`;
      tile.style.height = `${rowInterval}px`;
      tile.style.backgroundImage = `url(${this.image.src})`;
      tile.style.backgroundSize = `${this.image.width}px ${this.image.height}px`;
      tile.style.backgroundPosition = `-${x}px -${y}px`;
      tile.style.border = '1px solid rgba(0,0,0,0.2)';
      tile.style.boxSizing = 'border-box';
      tile.style.cursor = 'pointer';
      tile.style.display = 'flex';
      tile.style.alignItems = 'flex-end';
      tile.style.justifyContent = 'center';
      
      // Add drag and drop attributes
      tile.draggable = true;
      tile.style.transition = 'transform 0.2s ease';
      
      // Add drag and drop event listeners
      this.addDragDropListeners(tile);
      
      // Add hover effect
      tile.addEventListener('mouseenter', () => {
        tile.style.transform = 'scale(1.02)';
        tile.style.zIndex = '10';
      });
      
      tile.addEventListener('mouseleave', () => {
        tile.style.transform = 'scale(1)';
        tile.style.zIndex = '1';
      });

      this.tiles.push(tile);
      this.container.appendChild(tile);
    });
  }

  placeAnswersInTiles(squareStarts, answers, rowInterval) {
    this.tiles.forEach((tile, index) => {
      const answerDiv = document.createElement('div');
      answerDiv.className = 'answer-overlay';
      answerDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
      answerDiv.style.padding = '8px';
      answerDiv.style.borderRadius = '4px';
      answerDiv.style.fontSize = '25px';
      answerDiv.style.fontFamily = 'Arial';
      answerDiv.style.color = 'black';
      answerDiv.style.pointerEvents = 'none';
      answerDiv.style.zIndex = '5';
      const answerText = answers[index] || '';
      
      // Temporary: Always try to render math for debugging
      console.log('Processing answer in puzzleRenderer:', answerText);
      answerDiv.innerHTML = MathRenderer.render(answerText);
      
      // Original logic (commented for debugging):
      // if (MathRenderer.containsMath(answerText)) {
      //   answerDiv.innerHTML = MathRenderer.render(answerText);
      // } else {
      //   answerDiv.textContent = answerText;
      // }
      
      tile.appendChild(answerDiv);
    });
  }

  shuffleTiles(squareStarts, columnInterval, rowInterval) {
    // Create a copy of positions for shuffling
    const positions = [...squareStarts];
    
    // Fisher-Yates shuffle
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Move tiles to shuffled positions
    this.tiles.forEach((tile, index) => {
      const newPosition = positions[index];
      tile.style.left = `${newPosition.x}px`;
      tile.style.top = `${newPosition.y}px`;
      tile.dataset.currentX = newPosition.x;
      tile.dataset.currentY = newPosition.y;
    });
  }

  clearContainer() {
    this.container.innerHTML = '';
    this.tiles = [];
  }

  drawGrid(columnInterval, rowInterval) {
    // Get container dimensions
    const width = parseInt(this.container.style.width);
    const height = parseInt(this.container.style.height);
    
    // Vertical lines
    for (let x = columnInterval; x < width; x += columnInterval) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = `${x}px`;
      line.style.top = '0';
      line.style.width = '1px';
      line.style.height = '100%';
      line.style.backgroundColor = 'black';
      line.style.pointerEvents = 'none';
      line.style.zIndex = '20';
      this.container.appendChild(line);
    }
    
    // Horizontal lines
    for (let y = rowInterval; y < height; y += rowInterval) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = '0';
      line.style.top = `${y}px`;
      line.style.width = '100%';
      line.style.height = '1px';
      line.style.backgroundColor = 'black';
      line.style.pointerEvents = 'none';
      line.style.zIndex = '20';
      this.container.appendChild(line);
    }
  }

  // Helper method to get tile at specific position (useful for drag & drop)
  getTileAtPosition(x, y) {
    return this.tiles.find(tile => {
      const rect = tile.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      const relativeX = x - containerRect.left;
      const relativeY = y - containerRect.top;
      
      return relativeX >= rect.left - containerRect.left && 
             relativeX <= rect.right - containerRect.left &&
             relativeY >= rect.top - containerRect.top && 
             relativeY <= rect.bottom - containerRect.top;
    });
  }

  // Add drag and drop event listeners to a tile
  addDragDropListeners(tile) {
    // Drag start
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', '');
      tile.style.opacity = '0.5';
      tile.classList.add('dragging');
    });

    // Drag end
    tile.addEventListener('dragend', (e) => {
      tile.style.opacity = '1';
      tile.classList.remove('dragging');
    });

    // Drag over (allow drop)
    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      tile.style.borderColor = '#007bff';
      tile.style.borderWidth = '2px';
    });

    // Drag leave
    tile.addEventListener('dragleave', (e) => {
      tile.style.borderColor = 'rgba(0,0,0,0.2)';
      tile.style.borderWidth = '1px';
    });

    // Drop
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.style.borderColor = 'rgba(0,0,0,0.2)';
      tile.style.borderWidth = '1px';
      
      const draggingTile = document.querySelector('.dragging');
      if (draggingTile && draggingTile !== tile) {
        this.swapTiles(draggingTile, tile);
      }
    });
  }

  // Helper method to swap two tiles (useful for drag & drop)
  swapTiles(tile1, tile2) {
    // Get the indices of both tiles in the tiles array
    const tile1Index = this.tiles.indexOf(tile1);
    const tile2Index = this.tiles.indexOf(tile2);
    
    // Swap only the visual positions, keeping the background images with their tiles
    const temp1X = tile1.style.left;
    const temp1Y = tile1.style.top;
    
    tile1.style.left = tile2.style.left;
    tile1.style.top = tile2.style.top;
    
    tile2.style.left = temp1X;
    tile2.style.top = temp1Y;
    
    // Update current position datasets
    const temp1DataX = tile1.dataset.currentX;
    const temp1DataY = tile1.dataset.currentY;
    
    tile1.dataset.currentX = tile2.dataset.currentX;
    tile1.dataset.currentY = tile2.dataset.currentY;
    
    tile2.dataset.currentX = temp1DataX;
    tile2.dataset.currentY = temp1DataY;
    
    // Swap elements in the tiles array to maintain array representation
    if (tile1Index !== -1 && tile2Index !== -1) {
      [this.tiles[tile1Index], this.tiles[tile2Index]] = [this.tiles[tile2Index], this.tiles[tile1Index]];
    }
  }
}