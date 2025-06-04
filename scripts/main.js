// Main application class
class AIBattleCards {
  constructor() {
    this.loader = null;
    this.cardManager = null;
    this.initialized = false;
  }

  // Initialize the application
  async initialize() {
    try {
      // Always use LocalLoader for GitHub Pages/static hosting
      console.log('Running in static/GitHub Pages mode');
      this.loader = new LocalLoader(window.APP_CONFIG);

      await this.loader.initialize();

      // Create and initialize card manager
      this.cardManager = new CardManager(this.loader);
      await this.cardManager.initialize();

      // Set up error handling
      this.setupErrorHandling();

      // Mark as initialized
      this.initialized = true;
      console.log('AI Battle Cards initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Battle Cards:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  // Set up error handling
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError('An unexpected error occurred. Please refresh the page.');
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('An unexpected error occurred. Please refresh the page.');
    });
  }

  // Show error message to user
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Handle window resize
  handleResize() {
    if (this.cardManager) {
      this.cardManager.updatePreviewPosition();
    }
  }
}

// Wait for all scripts to load before initializing
window.addEventListener('load', () => {
  const app = new AIBattleCards();
  app.initialize();

  // Handle window resize
  window.addEventListener('resize', () => {
    app.handleResize();
  });
}); 