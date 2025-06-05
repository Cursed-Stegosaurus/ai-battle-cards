class SimpleCardApp {
  constructor() {
    this.mainCardIds = [
      'Artificer', 'Companion', 'Strategist', 'Prodigy', 'Polymath', 'Composer',
      'Oracle', 'Scholar', 'Prospector', 'Collective', 'Voyager', 'Diplomat',
      'Commons', 'Navigator', 'Maverick', 'Scout'
    ];
    this.cards = [];
    this.selectedCardId = null;
    this.filter = 'all'; // 'all' or 'picks'
    this.natesPicks = ['Artificer', 'Companion', 'Polymath', 'Oracle', 'Scholar'];
    this.searchQuery = '';
    this.searchTimeout = null;
    this.init();
  }

  async init() {
    try {
      await this.loadCards();
      this.setupSearchInput();
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
    const response = await fetch('new_cards.json');
    const data = await response.json();
    // Only include main cards
    this.cards = data.filter(card => this.mainCardIds.includes(card.id)).map(card => ({
      id: card.id,
      model: card.model,
      title: `${card.id} - ${card.model}`,
      frontImage: `Cards/${card.id}.jpg`,
      backImage: "Cards/card back.jpg",
      body: card.body
    }));
  }

  setupSearchInput() {
    // Remove any existing search input
    const oldSearch = document.querySelector('.search-container .search-input');
    if (oldSearch) oldSearch.parentNode.removeChild(oldSearch);
    const oldIcon = document.querySelector('.search-container .search-icon');
    if (oldIcon) oldIcon.parentNode.removeChild(oldIcon);
    const oldClear = document.querySelector('.search-container .search-clear-btn');
    if (oldClear) oldClear.parentNode.removeChild(oldClear);

    const searchIcon = document.createElement('span');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = '🔍';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search cards...';
    searchInput.autocomplete = 'off';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-clear-btn';
    clearBtn.innerHTML = '&times;';
    clearBtn.title = 'Clear search';
    clearBtn.tabIndex = 0;
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      this.renderCards();
      searchInput.focus();
      if (window.innerWidth <= 700 && window.mobileStackUI) {
        window.mobileStackUI.searchQuery = '';
        window.mobileStackUI.updateFilteredStack();
      }
    });

    // Add input event listener with debouncing
    searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCards();
        if (window.innerWidth <= 700 && window.mobileStackUI) {
          window.mobileStackUI.searchQuery = this.searchQuery;
          window.mobileStackUI.updateFilteredStack();
        }
        // Show/hide clear button
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
      }, 300);
    });

    // Show/hide clear button on load
    clearBtn.style.display = searchInput.value ? 'block' : 'none';

    // Insert into the correct container
    let container;
    if (window.innerWidth > 700) {
      // Desktop: header
      container = document.querySelector('.main-header .search-container');
    } else {
      // Mobile: mobile stack
      container = document.querySelector('.mobile-stack-container .search-container');
    }
    container.appendChild(searchIcon);
    container.appendChild(searchInput);
    container.appendChild(clearBtn);

    // Keyboard shortcut: Ctrl+F or Cmd+F focuses the search input
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key === 'f') || (!isMac && e.ctrlKey && e.key === 'f')) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  getFilteredCards() {
    let filteredCards = this.cards;
    
    // Apply filter (all/picks)
    if (this.filter === 'picks') {
      filteredCards = filteredCards.filter(card => this.natesPicks.includes(card.id));
    }
    
    // Apply search query
    if (this.searchQuery) {
      filteredCards = filteredCards.filter(card => {
        const searchableText = [
          card.id,
          card.model,
          card.title,
          card.body
        ].join(' ').toLowerCase();
        
        return searchableText.includes(this.searchQuery);
      });
    }
    
    return filteredCards;
  }

  renderCards() {
    const gridElement = document.querySelector('.card-grid');
    gridElement.innerHTML = '';

    const filteredCards = this.getFilteredCards();
    
    if (filteredCards.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No cards found matching your search';
      gridElement.appendChild(noResults);
      return;
    }

    filteredCards.forEach(card => {
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
    if (descElement) descElement.innerHTML = '';
    if (metadataElement) metadataElement.innerHTML = card.body ? `<div style='white-space:pre-line;'>${card.body}</div>` : '';
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

// --- MOBILE STACK/SWIPE UI ---
class MobileStackUI {
  constructor(cards, natesPicks) {
    this.mainCardIds = [
      'Artificer', 'Companion', 'Strategist', 'Prodigy', 'Polymath', 'Composer',
      'Oracle', 'Scholar', 'Prospector', 'Collective', 'Voyager', 'Diplomat',
      'Commons', 'Navigator', 'Maverick', 'Scout'
    ];
    this.cards = cards.filter(card => this.mainCardIds.includes(card.id));
    this.natesPicks = natesPicks;
    this.filter = 'all';
    this.searchQuery = '';
    this.searchTimeout = null;
    this.filteredStack = this.cards;
    this.currentIndex = 0;
    this.lastIndexByFilter = { all: 0, picks: 0 };
    this.setup();
  }

  setup() {
    this.stackEl = document.querySelector('.card-stack');
    this.detailsEl = document.querySelector('.mobile-card-details');
    this.filterBtns = document.querySelectorAll('.mobile-filter-buttons .filter-btn');
    this.setupSearchInput();
    this.attachFilterEvents();
    this.render();
    this.attachSwipeEvents();
  }

  setupSearchInput() {
    // Remove any existing search input
    const oldSearch = document.querySelector('.search-container .search-input');
    if (oldSearch) oldSearch.parentNode.removeChild(oldSearch);
    const oldIcon = document.querySelector('.search-container .search-icon');
    if (oldIcon) oldIcon.parentNode.removeChild(oldIcon);

    const searchIcon = document.createElement('span');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = '🔍';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search cards...';

    // Add input event listener with debouncing
    searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.updateFilteredStack();
      }, 300);
    });

    // Insert into the correct container
    if (window.innerWidth > 700) {
      // Desktop: header
      const headerSearch = document.querySelector('.main-header .search-container');
      headerSearch.appendChild(searchIcon);
      headerSearch.appendChild(searchInput);
    } else {
      // Mobile: mobile stack
      const mobileSearch = document.querySelector('.mobile-stack-container .search-container');
      mobileSearch.appendChild(searchIcon);
      mobileSearch.appendChild(searchInput);
    }
  }

  updateFilteredStack() {
    let filtered = this.filter === 'all' ? this.cards : this.cards.filter(card => this.natesPicks.includes(card.id));
    
    if (this.searchQuery) {
      filtered = filtered.filter(card => {
        const searchableText = [
          card.id,
          card.model,
          card.title,
          card.body
        ].join(' ').toLowerCase();
        
        return searchableText.includes(this.searchQuery);
      });
    }
    
    this.filteredStack = filtered;
    this.currentIndex = 0;
    this.render();
  }

  attachFilterEvents() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        this.setFilter(filter);
      });
    });
  }

  setFilter(filter) {
    if (this.filter === filter) return;
    this.lastIndexByFilter[this.filter] = this.currentIndex;
    this.filter = filter;
    this.updateFilteredStack();
  }

  attachSwipeEvents() {
    let startX = null;
    let isSwiping = false;
    this.stackEl.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      isSwiping = true;
    });
    this.stackEl.addEventListener('touchmove', e => {
      if (!isSwiping || e.touches.length !== 1) return;
      // Optionally, add drag effect here
    });
    this.stackEl.addEventListener('touchend', e => {
      if (!isSwiping) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) this.nextCard();
        else this.prevCard();
      }
      isSwiping = false;
    });
  }

  nextCard() {
    const oldIdx = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.filteredStack.length;
    this.animateCard('left', oldIdx, this.currentIndex);
  }

  prevCard() {
    const oldIdx = this.currentIndex;
    this.currentIndex = (this.currentIndex - 1 + this.filteredStack.length) % this.filteredStack.length;
    this.animateCard('right', oldIdx, this.currentIndex);
  }

  animateCard(direction, oldIdx, newIdx) {
    const oldCard = this.createCardElement(this.filteredStack[oldIdx]);
    const newCard = this.createCardElement(this.filteredStack[newIdx]);
    oldCard.classList.add('stack-card');
    newCard.classList.add('stack-card');
    this.stackEl.innerHTML = '';
    this.stackEl.appendChild(oldCard);
    this.stackEl.appendChild(newCard);
    // Animate out old card
    requestAnimationFrame(() => {
      oldCard.classList.add(direction === 'left' ? 'slide-left' : 'slide-right');
      newCard.style.opacity = '0';
      newCard.style.transform = `translateX(${direction === 'left' ? '120vw' : '-120vw'})`;
      requestAnimationFrame(() => {
        newCard.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s';
        newCard.style.opacity = '1';
        newCard.style.transform = '';
      });
    });
    // Animate text
    this.detailsEl.classList.add('fade-out');
    setTimeout(() => {
      this.renderDetails();
      this.detailsEl.classList.remove('fade-out');
      this.detailsEl.classList.add('fade-in');
      setTimeout(() => this.detailsEl.classList.remove('fade-in'), 300);
    }, 200);
    setTimeout(() => {
      this.stackEl.innerHTML = '';
      this.stackEl.appendChild(newCard);
    }, 350);
  }

  render() {
    this.stackEl.innerHTML = '';
    if (!this.filteredStack.length) return;
    const card = this.createCardElement(this.filteredStack[this.currentIndex]);
    card.classList.add('stack-card');
    this.stackEl.appendChild(card);
    this.renderDetails();
  }

  renderDetails() {
    if (!this.filteredStack.length) {
      this.detailsEl.innerHTML = '';
      return;
    }
    const card = this.filteredStack[this.currentIndex];
    let detailsHtml = '';
    if (card.title) detailsHtml += `<h2 style="margin:0 0 0.7rem 0; color:var(--highlight); font-size:1.2rem;">${card.title}</h2>`;
    if (card.body) detailsHtml += `<div style='white-space:pre-line;'>${card.body}</div>`;
    this.detailsEl.innerHTML = detailsHtml;
  }

  createCardElement(card) {
    const container = document.createElement('div');
    container.className = 'stack-card';
    const img = document.createElement('img');
    img.src = card.frontImage;
    img.alt = card.title;
    container.appendChild(img);
    return container;
  }
}

// --- END MOBILE STACK/SWIPE UI ---

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const app = new SimpleCardApp();
  // Mobile stack UI
  if (window.innerWidth <= 700) {
    app.loadCards().then(() => {
      new MobileStackUI(app.cards, app.natesPicks);
    });
  }
}); 