# Card Flip Spec: Nate's AI Battle Cards

## Platform
- **Static site** on GitHub Pages
- No SharePoint, no dynamic loading

## Card Flip/Preview Logic
- Cards show their face by default in the grid
- When clicked, the card shows its back in the grid and its face in the preview panel
- All logic handled by a single JavaScript file (`simple-card-app.js`)
- No authentication or SharePoint-specific logic

## 1. Animation Overview

### 1.1 Core Animation Properties
- **Type**: 3D Transform (Y-axis rotation)
- **Duration**: 0.6 seconds
- **Timing Function**: cubic-bezier(0.4, 0.0, 0.2, 1)
- **Perspective**: 1000px
- **Backface Visibility**: hidden

### 1.2 Animation States
1. **Initial State**
   - Front face visible
   - Back face hidden
   - No rotation

2. **Flipped State**
   - Front face hidden
   - Back face visible
   - 180° Y-axis rotation

3. **Transition State**
   - Smooth rotation between states
   - Proper face visibility toggling
   - Maintained aspect ratio

## 2. CSS Implementation

### 2.1 Card Container
```css
.card-container {
  perspective: 1000px;
  width: var(--card-width);
  height: var(--card-height);
  position: relative;
  cursor: pointer;
}
```

### 2.2 Card Element
```css
.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card.flipped {
  transform: rotateY(180deg);
}
```

### 2.3 Card Faces
```css
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
}
```

## 3. JavaScript Implementation

### 3.1 State Management
```javascript
class CardManager {
  constructor() {
    this.selectedCard = null;
    this.gridCards = new Map();
    this.previewCard = null;
  }

  // Track card states
  initializeCard(cardElement, isPreview = false) {
    const card = {
      element: cardElement,
      isFlipped: false,
      isPreview
    };
    
    if (isPreview) {
      this.previewCard = card;
    } else {
      this.gridCards.set(cardElement, card);
    }
  }

  // Handle card selection
  selectCard(cardElement) {
    if (this.selectedCard === cardElement) {
      this.resetSelection();
      return;
    }

    // Reset previous selection
    if (this.selectedCard) {
      this.flipCard(this.gridCards.get(this.selectedCard), false);
    }

    // Set new selection
    this.selectedCard = cardElement;
    this.flipCard(this.gridCards.get(cardElement), true);
    this.flipCard(this.previewCard, false);
  }

  // Reset selection
  resetSelection() {
    if (this.selectedCard) {
      this.flipCard(this.gridCards.get(this.selectedCard), false);
      this.selectedCard = null;
    }
  }
}
```

### 3.2 Event Handling
```javascript
function initializeCardInteractions() {
  const cardManager = new CardManager();
  
  // Initialize grid cards
  document.querySelectorAll('.card-container').forEach(card => {
    cardManager.initializeCard(card);
    card.addEventListener('click', () => cardManager.selectCard(card));
  });

  // Initialize preview card
  const previewCard = document.querySelector('.preview .card-container');
  cardManager.initializeCard(previewCard, true);
}
```

## 4. Performance Considerations

### 4.1 Optimization Techniques
- Use `transform` instead of position properties
- Implement `will-change: transform` for smoother animations
- Preload card images
- Use hardware acceleration
- Implement proper cleanup on unmount

### 4.2 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback for older browsers
- Graceful degradation
- Feature detection

## 5. Testing Requirements

### 5.1 Animation Testing
- Smoothness of rotation
- Proper face visibility
- State synchronization
- Performance metrics
- Memory usage

### 5.2 Interaction Testing
- Click handling
- State management
- Error handling
- Edge cases
- Browser compatibility

## 6. Implementation Checklist

- [ ] Set up CSS transforms and transitions
- [ ] Implement state management
- [ ] Add event listeners
- [ ] Test performance
- [ ] Verify browser support
- [ ] Document implementation
- [ ] Create test cases
- [ ] Review accessibility 