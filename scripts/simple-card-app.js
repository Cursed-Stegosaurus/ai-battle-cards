class SimpleCardApp {
  constructor() {
    this.cards = [];
    this.selectedCardId = null;
    this.init();
  }

  async init() {
    try {
      await this.loadCards();
      this.renderCards();
      this.setupEventListeners();
      this.clearPreview(); // Initialize preview with card back
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load cards. Please refresh the page.');
    }
  }

  async loadCards() {
    const response = await fetch('cards.json');
    const data = await response.json();
    
    // Simple mapping - use the data as-is with minimal processing
    this.cards = data.map(card => ({
      id: card.id,
      title: card.title,
      frontImage: card.front, // "Cards/Artificer.jpg"
      backImage: "Cards/card back.jpg", // Generic back for all cards
      description: card.what,
      usage: card.why,
      when: Array.isArray(card.when) ? card.when.join(', ') : card.when,
      watch: card.watch
    }));
  }

  renderCards() {
    const gridElement = document.querySelector('.card-grid');
    gridElement.innerHTML = '';

    this.cards.forEach(card => {
      const cardElement = this.createCardElement(card);
      gridElement.appendChild(cardElement);
    });
  }

  createCardElement(card) {
    const container = document.createElement('div');
    container.className = 'simple-card';
    container.dataset.id = card.id;
    
    // Use a simple img element - no complex 3D flipping
    const img = document.createElement('img');
    img.src = card.frontImage; // Show front by default
    img.alt = card.title;
    img.className = 'card-image';
    
    container.appendChild(img);
    return container;
  }

  setupEventListeners() {
    const gridElement = document.querySelector('.card-grid');
    
    gridElement.addEventListener('click', (event) => {
      const cardElement = event.target.closest('.simple-card');
      if (cardElement) {
        this.selectCard(cardElement.dataset.id);
      }
    });
  }

  selectCard(cardId) {
    // Remove previous selection
    if (this.selectedCardId) {
      this.updateCardDisplay(this.selectedCardId, false);
    }

    // Handle clicking the same card
    if (this.selectedCardId === cardId) {
      this.selectedCardId = null;
      this.clearPreview();
      return;
    }

    // Set new selection
    this.selectedCardId = cardId;
    this.updateCardDisplay(cardId, true);
    this.updatePreview(cardId);
  }

  updateCardDisplay(cardId, isSelected) {
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    const img = cardElement.querySelector('.card-image');
    const card = this.cards.find(c => c.id === cardId);

    if (isSelected) {
      cardElement.classList.add('selected');
      img.src = card.backImage; // Show back when selected
    } else {
      cardElement.classList.remove('selected');
      img.src = card.frontImage; // Show front when deselected
    }
  }

  updatePreview(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    // Update preview image
    const previewImg = document.querySelector('.preview-card .card-image');
    if (previewImg) {
      previewImg.src = card.frontImage; // Always show front in preview
    }

    // Update card details
    const titleElement = document.querySelector('.card-title');
    const descElement = document.querySelector('.card-description');
    const metadataElement = document.querySelector('.card-metadata');

    if (titleElement) titleElement.textContent = card.title;
    if (descElement) descElement.textContent = card.description;
    if (metadataElement) {
      metadataElement.innerHTML = `
        <p><strong>Why:</strong> ${card.usage}</p>
        <p><strong>When:</strong> ${card.when}</p>
        <p><strong>Watch:</strong> ${card.watch}</p>
      `;
    }
  }

  clearPreview() {
    const previewImg = document.querySelector('.preview-card .card-image');
    const titleElement = document.querySelector('.card-title');
    const descElement = document.querySelector('.card-description');
    const metadataElement = document.querySelector('.card-metadata');

    if (previewImg) previewImg.src = 'Cards/card back.jpg'; // Show card back by default
    if (titleElement) titleElement.textContent = 'Select a card to preview';
    if (descElement) descElement.textContent = '';
    if (metadataElement) metadataElement.innerHTML = '';
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SimpleCardApp();
}); 