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
  getImageUrl(imageName) {
    return `${this.config.local.imageFolder}/${imageName}`;
  }

  // Load a single image
  async loadImage(imageName) {
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
        reject(new Error(APP_CONFIG.errors.imageLoadFailed));
      };
      
      img.src = url;
    });
  }

  // Preload all card images
  async preloadImages() {
    try {
      const cardData = await this.loadCardData();
      const imageNames = new Set();
      
      // Collect all image names
      cardData.forEach(card => {
        imageNames.add(card.frontImage);
        imageNames.add(card.backImage);
      });
      
      // Add card back image
      imageNames.add(this.config.local.cardBackImage);
      
      // Load all images
      await Promise.all(
        Array.from(imageNames).map(name => this.loadImage(name))
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
      model: item.model,
      vendor: item.vendor,
      idealFor: item.idealFor,
      starterPrompt: item.starterPrompt,
      nextLevelPrompt: item.nextLevelPrompt,
      reflectionQuestion: item.reflectionQuestion,
      frontImage: item.frontImage,
      backImage: this.config.local.cardBackImage
    }));
  }

  // Clear cache
  clearCache() {
    this.imageCache.clear();
    this.dataCache = null;
  }
}

// Export the loader
window.LocalLoader = LocalLoader; 