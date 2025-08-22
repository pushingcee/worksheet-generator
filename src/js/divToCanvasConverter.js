export class DivToCanvasConverter {
  
  /**
   * Converts a div container with puzzle tiles to a canvas
   */
  static async convertPuzzleToCanvas(divContainer) {
    if (!divContainer || divContainer.children.length === 0) {
      throw new Error("Invalid or empty div container");
    }

    const canvas = document.createElement('canvas');
    const containerWidth = parseInt(divContainer.style.width);
    const containerHeight = parseInt(divContainer.style.height);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d');

    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get all tiles (puzzle pieces)
    const tiles = Array.from(divContainer.querySelectorAll('.puzzle-tile'));
    
    // Sort tiles by their current position to ensure proper layering
    tiles.sort((a, b) => {
      const aTop = parseInt(a.style.top);
      const bTop = parseInt(b.style.top);
      if (aTop !== bTop) return aTop - bTop;
      return parseInt(a.style.left) - parseInt(b.style.left);
    });

    // Draw each tile
    for (const tile of tiles) {
      await this._drawTileOnCanvas(ctx, tile);
    }

    // Draw grid lines
    const gridLines = Array.from(divContainer.children).filter(child => 
      child.style.backgroundColor === 'black' && 
      (child.style.width === '1px' || child.style.height === '1px')
    );

    this._drawGridLines(ctx, gridLines);

    // Draw answer overlays
    const answerOverlays = Array.from(divContainer.querySelectorAll('.answer-overlay'));
    for (const overlay of answerOverlays) {
      this._drawAnswerOverlay(ctx, overlay);
    }

    return canvas;
  }

  /**
   * Converts a problem grid div to canvas
   */
  static convertProblemGridToCanvas(divContainer) {
    if (!divContainer || divContainer.children.length === 0) {
      throw new Error("Invalid or empty div container");
    }

    const canvas = document.createElement('canvas');
    const containerWidth = parseInt(divContainer.style.width);
    const containerHeight = parseInt(divContainer.style.height);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d');

    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    const gridLines = Array.from(divContainer.children).filter(child => 
      child.style.backgroundColor === 'black' && 
      (child.style.width === '1px' || child.style.height === '1px')
    );

    this._drawGridLines(ctx, gridLines);

    // Draw text elements
    const textElements = Array.from(divContainer.children).filter(child => 
      child.textContent && child.textContent.trim() !== ''
    );

    for (const textElement of textElements) {
      this._drawTextElement(ctx, textElement);
    }

    return canvas;
  }

  static async _drawTileOnCanvas(ctx, tile) {
    const left = parseInt(tile.style.left);
    const top = parseInt(tile.style.top);
    const width = parseInt(tile.style.width);
    const height = parseInt(tile.style.height);
    
    // Extract background image URL and position
    const bgImage = tile.style.backgroundImage;
    const bgPosition = tile.style.backgroundPosition;
    
    if (bgImage && bgImage !== 'none') {
      // Extract URL from 'url("...")'
      const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
      if (urlMatch) {
        const imageUrl = urlMatch[1];
        
        try {
          const img = await this._loadImage(imageUrl);
          
          // Parse background position
          const [bgX, bgY] = bgPosition.split(' ').map(pos => parseInt(pos));
          
          // Draw the clipped portion of the image
          ctx.save();
          ctx.beginPath();
          ctx.rect(left, top, width, height);
          ctx.clip();
          
          ctx.drawImage(
            img, 
            left + bgX, top + bgY, // Source position offset by tile position
            img.width, img.height
          );
          
          ctx.restore();
          
          // Draw tile border
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(left, top, width, height);
          
        } catch (error) {
          console.warn('Failed to load image for tile:', error);
          // Draw placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(left, top, width, height);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(left, top, width, height);
        }
      }
    }
  }

  static _drawGridLines(ctx, gridLines) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    for (const line of gridLines) {
      const left = parseInt(line.style.left);
      const top = parseInt(line.style.top);
      const width = parseInt(line.style.width);
      const height = parseInt(line.style.height);
      
      if (width === 1) {
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, top + height);
        ctx.stroke();
      } else if (height === 1) {
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left + width, top);
        ctx.stroke();
      }
    }
  }

  static _drawAnswerOverlay(ctx, overlay) {
    const left = parseInt(overlay.style.left);
    const top = parseInt(overlay.style.top);
    const width = parseInt(overlay.style.width);
    const height = parseInt(overlay.style.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(left, top, width, height);
    
    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = '25px Arial';
    ctx.textBaseline = 'middle';
    
    const text = overlay.textContent;
    const textY = top + height / 2;
    ctx.fillText(text, left + 5, textY, width - 10);
  }

  static _drawTextElement(ctx, textElement) {
    const left = parseInt(textElement.style.left);
    const top = parseInt(textElement.style.top);
    const fontSize = textElement.style.fontSize || '20px';
    const fontFamily = textElement.style.fontFamily || 'Arial';
    
    ctx.fillStyle = 'black';
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.textBaseline = 'top';
    
    const text = textElement.textContent;
    ctx.fillText(text, left, top);
  }

  static _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}