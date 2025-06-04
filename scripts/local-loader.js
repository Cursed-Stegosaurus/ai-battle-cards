class LocalLoader {
  constructor(config) {
    this.config = config;
    this.imageCache = new Map();
    this.dataCache = null;
  }

  // Initialize the loader
  async initialize() {
    try {
      await this.loadCardData();
      await this.preloadImages();
    } catch (error) {
      console.error('Local initialization failed:', error);
      throw error;
    }
  }

  // Get image URL for local development
  getImageUrl(imagePath) {
    // If the path already includes a folder (like "Cards/Artificer.jpg"), use it directly
    // If it's just a filename (like "card back.jpg"), add the image folder prefix
    if (imagePath.includes('/')) {
      return imagePath; // Path already includes folder
    } else {
      return `${this.config.local.imageFolder}/${imagePath}`;
    }
  }

  // Load a single image
  async loadImage(imageName) {
    if (!imageName) {
      throw new Error('Missing image name for card');
    }
    if (this.imageCache.has(imageName)) {
      return this.imageCache.get(imageName);
    }

    const url = this.getImageUrl(imageName);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(imageName, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(APP_CONFIG.errors?.imageLoadFailed || 'Failed to load card image'));
      };
      img.src = url;
    });
  }

  // Preload all card images
  async preloadImages() {
    try {
      const cardData = await this.loadCardData();
      const imageNames = new Set();
      // Collect all image names from the processed card data
      cardData.forEach(card => {
        imageNames.add(card.frontImage); // This will be "Cards/Artificer.jpg" etc.
        imageNames.add(card.backImage);   // This will be "card back.jpg"
      });
      // Load all images
      await Promise.all(
        Array.from(imageNames).map(imagePath => this.loadImage(imagePath))
      );
    } catch (error) {
      console.error('Image preloading failed:', error);
      throw error;
    }
  }

  // Load card data from local JSON file
  async loadCardData() {
    if (this.dataCache) {
      return this.dataCache;
    }
    try {
      const response = await fetch(this.config.local.dataFile);
      if (!response.ok) {
        throw new Error(APP_CONFIG.errors.dataLoadFailed);
      }
      const data = await response.json();
      this.dataCache = this.processCardData(data);
      return this.dataCache;
    } catch (error) {
      console.error('Card data loading failed:', error);
      throw error;
    }
  }

  // Process raw card data into application format
  processCardData(rawData) {
    return rawData.map(item => ({
      id: item.id,
      title: item.title,
      model: this.extractModelFromTitle(item.title),
      vendor: this.extractVendorFromTitle(item.title),
      idealFor: item.what,
      starterPrompt: item.why,
      nextLevelPrompt: Array.isArray(item.when) ? item.when.join(', ') : item.when,
      reflectionQuestion: item.watch,
      frontImage: item.front,
      backImage: this.config.local.cardBackImage
    }));
  }

  // Helper method to extract model name from title
  extractModelFromTitle(title) {
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[1] : title;
  }

  // Helper method to extract vendor from model name
  extractVendorFromTitle(title) {
    const model = this.extractModelFromTitle(title);
    if (model.includes('ChatGPT') || model.includes('GPT')) return 'OpenAI';
    if (model.includes('Claude')) return 'Anthropic';
    if (model.includes('Gemini')) return 'Google';
    if (model.includes('DeepSeek')) return 'DeepSeek';
    if (model.includes('Mixtral')) return 'Mistral';
    if (model.includes('Yi-')) return '01.AI';
    if (model.includes('Command')) return 'Cohere';
    if (model.includes('Llama')) return 'Meta';
    if (model.includes('Mistral')) return 'Mistral';
    if (model.includes('Grok')) return 'xAI';
    if (model.includes('Perplexity')) return 'Perplexity';
    return 'Unknown';
  }

  // Clear cache
  clearCache() {
    this.imageCache.clear();
    this.dataCache = null;
  }
}

// Export the loader
window.LocalLoader = LocalLoader; 