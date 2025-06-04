class CardManager {
  constructor(sharePointLoader) {
    this.loader = sharePointLoader;
    this.cards = new Map();
    this.selectedCardId = null;
    this.previewCard = null;
    this.gridElement = document.querySelector('.card-grid');
    this.previewElement = document.querySelector('.preview');
  }

  // Initialize the card manager
  async initialize() {
    try {
      const cardData = await this.loader.loadCardData();
      this.createCards(cardData);
      this.setupEventListeners();
    } catch (error) {
      console.error('Card manager initialization failed:', error);
      throw error;
    }
  }

  // Create card elements
  createCards(cardData) {
    cardData.forEach(card => {
      const cardElement = this.createCardElement(card);
      this.cards.set(card.id, {
        element: cardElement,
        data: card
      });
      this.gridElement.appendChild(cardElement);
    });
  }

  // Create a single card element
  createCardElement(card) {
    const container = document.createElement('div');
    container.className = 'card-container';
    container.dataset.id = card.id;

    const cardElement = document.createElement('div');
    cardElement.className = 'card';

    // Front face
    const frontFace = document.createElement('div');
    frontFace.className = 'card-face card-front';
    const frontImg = document.createElement('img');
    frontImg.src = this.loader.getImageUrl(card.frontImage);
    frontImg.alt = card.title;
    frontFace.appendChild(frontImg);

    // Back face
    const backFace = document.createElement('div');
    backFace.className = 'card-face card-back';
    const backImg = document.createElement('img');
    backImg.src = this.loader.getImageUrl(card.backImage);
    backImg.alt = 'Card Back';
    backFace.appendChild(backImg);

    cardElement.appendChild(frontFace);
    cardElement.appendChild(backFace);
    container.appendChild(cardElement);

    return container;
  }

  // Set up event listeners
  setupEventListeners() {
    this.gridElement.addEventListener('click', (event) => {
      const cardContainer = event.target.closest('.card-container');
      if (cardContainer) {
        this.selectCard(cardContainer.dataset.id);
      }
    });

    // Handle window resize for preview panel
    window.addEventListener('resize', () => {
      this.updatePreviewPosition();
    });
  }

  // Select a card
  selectCard(cardId) {
    if (this.selectedCardId === cardId) {
      this.resetSelection();
      return;
    }

    // Reset previous selection
    if (this.selectedCardId) {
      const prevCard = this.cards.get(this.selectedCardId);
      if (prevCard) {
        prevCard.element.classList.remove('selected');
        prevCard.element.querySelector('.card').classList.remove('flipped');
      }
    }

    // Set new selection
    const newCard = this.cards.get(cardId);
    if (newCard) {
      newCard.element.classList.add('selected');
      newCard.element.querySelector('.card').classList.add('flipped');
      this.selectedCardId = cardId;
      this.updatePreview(newCard.data);
    }
  }

  // Reset card selection
  resetSelection() {
    if (this.selectedCardId) {
      const card = this.cards.get(this.selectedCardId);
      if (card) {
        card.element.classList.remove('selected');
        card.element.querySelector('.card').classList.remove('flipped');
      }
      this.selectedCardId = null;
      this.clearPreview();
    }
  }

  // Update preview panel
  updatePreview(cardData) {
    const previewCard = this.previewElement.querySelector('.preview-card');
    const cardTitle = this.previewElement.querySelector('.card-title');
    const cardDescription = this.previewElement.querySelector('.card-description');
    const cardMetadata = this.previewElement.querySelector('.card-metadata');

    // Update preview card
    const frontImg = previewCard.querySelector('.card-front img');
    const backImg = previewCard.querySelector('.card-back img');
    frontImg.src = this.loader.getImageUrl(cardData.frontImage);
    backImg.src = this.loader.getImageUrl(cardData.backImage);

    // Update card details
    cardTitle.textContent = cardData.title;
    cardDescription.textContent = cardData.idealFor;
    
    // Update metadata
    cardMetadata.innerHTML = `
      <p><strong>Model:</strong> ${cardData.model}</p>
      <p><strong>Vendor:</strong> ${cardData.vendor}</p>
      <p><strong>Starter Prompt:</strong> ${cardData.starterPrompt}</p>
      <p><strong>Next Level:</strong> ${cardData.nextLevelPrompt}</p>
      <p><strong>Reflection:</strong> ${cardData.reflectionQuestion}</p>
    `;
  }

  // Clear preview panel
  clearPreview() {
    const previewCard = this.previewElement.querySelector('.preview-card');
    const cardTitle = this.previewElement.querySelector('.card-title');
    const cardDescription = this.previewElement.querySelector('.card-description');
    const cardMetadata = this.previewElement.querySelector('.card-metadata');

    previewCard.querySelector('.card').classList.remove('flipped');
    cardTitle.textContent = '';
    cardDescription.textContent = '';
    cardMetadata.innerHTML = '';
  }

  // Update preview panel position
  updatePreviewPosition() {
    const preview = this.previewElement;
    const rect = preview.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    
    const newTop = Math.max(0, Math.min(
      viewportHeight - rect.height,
      scrollTop + (viewportHeight - rect.height) / 2
    ));
    
    preview.style.top = `${newTop}px`;
  }
}

// Export the card manager
window.CardManager = CardManager; 