class SimpleCardApp {
  constructor() {
    this.cards = [];
    this.selectedCardId = null;
    this.filter = 'all'; // 'all' or 'picks'
    this.natesPicks = ['Artificer', 'Companion', 'Polymath', 'Oracle', 'Scholar'];
    this.init();
  }

  async init() {
    try {
      await this.loadCards();
      this.renderCards();
      this.setupEventListeners();
      this.clearPreview(); // Initialize preview with card back
      this.setupFilterButtons();
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

    // Add flipping class to trigger animation
    cardElement.classList.add('flipping');

    // At halfway point, swap the image
    setTimeout(() => {
      img.src = isSelected ? card.backImage : card.frontImage;
    }, 250); // Half of 0.5s animation

    // Remove flipping class after animation
    setTimeout(() => {
      cardElement.classList.remove('flipping');
    }, 500);
  }

  updatePreview(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    // Animate the preview card flip
    const previewCard = document.querySelector('.preview-card');
    const previewImg = previewCard.querySelector('.card-image');
    previewCard.classList.add('flipping');

    // At halfway point, swap the image
    setTimeout(() => {
      previewImg.src = card.frontImage; // Always show front in preview
    }, 250);

    // Remove flipping class after animation
    setTimeout(() => {
      previewCard.classList.remove('flipping');
    }, 500);

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
    const previewCard = document.querySelector('.preview-card');
    const previewImg = previewCard.querySelector('.card-image');
    const titleElement = document.querySelector('.card-title');
    const descElement = document.querySelector('.card-description');
    const metadataElement = document.querySelector('.card-metadata');

    // Animate the preview card flip to card back
    previewCard.classList.add('flipping');
    setTimeout(() => {
      previewImg.src = 'Cards/card back.jpg';
    }, 250);
    setTimeout(() => {
      previewCard.classList.remove('flipping');
    }, 500);

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

  setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        this.setFilter(filter);
      });
    });
  }

  setFilter(filter) {
    if (this.filter === filter) return;
    this.filter = filter;
    this.animateFilterChange();
  }

  animateFilterChange() {
    const gridElement = document.querySelector('.card-grid');
    const cardElements = Array.from(gridElement.querySelectorAll('.simple-card'));
    const showIds = this.filter === 'all'
      ? this.cards.map(card => card.id)
      : this.natesPicks;

    // FLIP: Record first positions
    const firstRects = new Map();
    cardElements.forEach(cardEl => {
      firstRects.set(cardEl.dataset.id, cardEl.getBoundingClientRect());
    });

    // Fade out cards not in showIds
    cardElements.forEach(cardEl => {
      const cardId = cardEl.dataset.id;
      if (!showIds.includes(cardId)) {
        cardEl.classList.add('fade-out');
        cardEl.classList.remove('fade-in');
      }
    });

    // After fade out, hide the cards
    setTimeout(() => {
      cardElements.forEach(cardEl => {
        const cardId = cardEl.dataset.id;
        if (!showIds.includes(cardId)) {
          cardEl.style.display = 'none';
        }
      });

      // Show cards coming back and set initial hidden state
      cardElements.forEach(cardEl => {
        const cardId = cardEl.dataset.id;
        if (showIds.includes(cardId)) {
          if (cardEl.style.display === 'none') {
            cardEl.style.display = '';
            cardEl.classList.remove('fade-in', 'fade-out', 'flip-animating');
            cardEl.style.opacity = '0';
            cardEl.style.transform = 'scale(0.8)';
          }
        }
      });

      // FLIP: Record last positions and animate
      const lastRects = new Map();
      cardElements.forEach(cardEl => {
        lastRects.set(cardEl.dataset.id, cardEl.getBoundingClientRect());
      });

      // Animate cards to new positions
      cardElements.forEach(cardEl => {
        const cardId = cardEl.dataset.id;
        if (!showIds.includes(cardId)) return;
        const first = firstRects.get(cardId);
        const last = lastRects.get(cardId);
        if (!first || !last) return;
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        cardEl.classList.add('flip-animating');
        cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
        // Force reflow
        cardEl.getBoundingClientRect();
        cardEl.style.transform = '';
        setTimeout(() => {
          cardEl.classList.remove('flip-animating');
        }, 400);
      });

      // Fade in cards coming back
      requestAnimationFrame(() => {
        cardElements.forEach(cardEl => {
          const cardId = cardEl.dataset.id;
          if (showIds.includes(cardId)) {
            cardEl.classList.add('fade-in');
            cardEl.classList.remove('fade-out');
            cardEl.style.opacity = '';
            cardEl.style.transform = '';
          }
        });
      });
    }, 400);
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SimpleCardApp();
}); 