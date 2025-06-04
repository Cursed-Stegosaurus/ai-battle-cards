# Card System Implementation Approach

## 1. Layout Structure

### 1.1 HTML Structure
```html
<div class="main">
  <!-- Left Panel: Scrollable Card Grid -->
  <section class="card-grid">
    <div class="card-container">
      <div class="card">
        <div class="card-face card-front">
          <img src="path/to/front.jpg" alt="Card Front">
        </div>
        <div class="card-face card-back">
          <img src="path/to/back.jpg" alt="Card Back">
        </div>
      </div>
    </div>
    <!-- Repeat for all cards -->
  </section>

  <!-- Right Panel: Fixed Preview -->
  <section class="preview">
    <div class="card-container">
      <div class="card">
        <div class="card-face card-front">
          <img src="" alt="Preview Front">
        </div>
        <div class="card-face card-back">
          <img src="" alt="Preview Back">
        </div>
      </div>
    </div>
    <div class="card-details">
      <!-- Card information will be populated here -->
    </div>
  </section>
</div>
```

### 1.2 CSS Layout
```css
/* Main Layout */
.main {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  height: calc(100vh - 4rem);
}

/* Card Grid */
.card-grid {
  flex: 0 0 60%;
  overflow-y: auto;
  padding-right: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  align-content: start;
}

/* Preview Panel */
.preview {
  flex: 0 0 35%;
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
```

## 2. State Management

### 2.1 Card State Interface
```typescript
interface CardState {
  id: string;
  isFlipped: boolean;
  isSelected: boolean;
  frontImage: string;
  backImage: string;
  details: CardDetails;
}

interface CardDetails {
  title: string;
  description: string;
  metadata: Record<string, string>;
}
```

### 2.2 State Management Class
```typescript
class CardStateManager {
  private cards: Map<string, CardState>;
  private selectedCardId: string | null;
  private previewCard: CardState | null;

  constructor() {
    this.cards = new Map();
    this.selectedCardId = null;
    this.previewCard = null;
  }

  // Initialize card states from JSON data
  initializeCards(cardData: CardData[]) {
    cardData.forEach(data => {
      this.cards.set(data.id, {
        id: data.id,
        isFlipped: false,
        isSelected: false,
        frontImage: data.frontImage,
        backImage: data.backImage,
        details: data.details
      });
    });
  }

  // Handle card selection
  selectCard(cardId: string) {
    if (this.selectedCardId === cardId) {
      this.resetSelection();
      return;
    }

    // Reset previous selection
    if (this.selectedCardId) {
      const prevCard = this.cards.get(this.selectedCardId);
      if (prevCard) {
        prevCard.isFlipped = false;
        prevCard.isSelected = false;
      }
    }

    // Set new selection
    const newCard = this.cards.get(cardId);
    if (newCard) {
      newCard.isFlipped = true;
      newCard.isSelected = true;
      this.selectedCardId = cardId;
      this.updatePreview(newCard);
    }
  }

  // Update preview card
  private updatePreview(card: CardState) {
    this.previewCard = {
      ...card,
      isFlipped: false
    };
  }
}
```

## 3. Event Handling

### 3.1 Event Listeners
```typescript
class CardEventHandler {
  private stateManager: CardStateManager;

  constructor(stateManager: CardStateManager) {
    this.stateManager = stateManager;
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    // Card click handling
    document.querySelectorAll('.card-container').forEach(container => {
      container.addEventListener('click', (e) => {
        const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
        if (cardId) {
          this.stateManager.selectCard(cardId);
          this.updateUI();
        }
      });
    });

    // Scroll handling for preview panel
    const previewPanel = document.querySelector('.preview');
    if (previewPanel) {
      window.addEventListener('scroll', () => {
        this.updatePreviewPosition();
      });
    }
  }

  private updateUI() {
    // Update card states
    this.stateManager.cards.forEach((card, id) => {
      const element = document.querySelector(`[data-card-id="${id}"]`);
      if (element) {
        element.classList.toggle('flipped', card.isFlipped);
        element.classList.toggle('selected', card.isSelected);
      }
    });

    // Update preview
    if (this.stateManager.previewCard) {
      this.updatePreviewCard(this.stateManager.previewCard);
    }
  }

  private updatePreviewPosition() {
    const preview = document.querySelector('.preview');
    if (preview) {
      const rect = preview.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      
      // Calculate new position
      const newTop = Math.max(0, Math.min(
        viewportHeight - rect.height,
        scrollTop + (viewportHeight - rect.height) / 2
      ));
      
      preview.style.top = `${newTop}px`;
    }
  }
}
```

## 4. Performance Optimizations

### 4.1 Image Loading
```typescript
class ImageLoader {
  private loadedImages: Set<string>;
  private imageCache: Map<string, HTMLImageElement>;

  constructor() {
    this.loadedImages = new Set();
    this.imageCache = new Map();
  }

  async preloadImages(imageUrls: string[]) {
    const loadPromises = imageUrls.map(url => this.loadImage(url));
    await Promise.all(loadPromises);
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedImages.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(url);
        this.imageCache.set(url, img);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
```

### 4.2 Animation Performance
```css
/* Performance optimizations */
.card {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.card-grid {
  will-change: transform;
  transform: translateZ(0);
}

.preview {
  will-change: transform;
  transform: translateZ(0);
}
```

## 5. Error Handling

### 5.1 Error Types
```typescript
enum CardError {
  IMAGE_LOAD_FAILED = 'IMAGE_LOAD_FAILED',
  STATE_UPDATE_FAILED = 'STATE_UPDATE_FAILED',
  INVALID_CARD_ID = 'INVALID_CARD_ID',
  PREVIEW_UPDATE_FAILED = 'PREVIEW_UPDATE_FAILED'
}
```

### 5.2 Error Handler
```typescript
class CardErrorHandler {
  handleError(error: CardError, context: any) {
    console.error(`Card Error: ${error}`, context);
    
    switch (error) {
      case CardError.IMAGE_LOAD_FAILED:
        this.handleImageLoadError(context);
        break;
      case CardError.STATE_UPDATE_FAILED:
        this.handleStateUpdateError(context);
        break;
      // Handle other error types
    }
  }

  private handleImageLoadError(context: any) {
    // Implement fallback image
    const element = context.element;
    if (element) {
      element.src = 'path/to/fallback-image.jpg';
    }
  }

  private handleStateUpdateError(context: any) {
    // Reset to last known good state
    this.resetToLastGoodState(context);
  }
}
```

## 6. Implementation Steps

1. Set up basic HTML structure
2. Implement CSS layout and animations
3. Create state management system
4. Add event handling
5. Implement image loading
6. Add error handling
7. Test and optimize
8. Document implementation 