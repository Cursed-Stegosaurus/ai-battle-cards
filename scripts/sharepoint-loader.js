class SharePointLoader {
  constructor(config) {
    this.config = config;
    this.imageCache = new Map();
    this.dataCache = null;
    this.retryCount = 0;
    this.digestValue = null;
  }

  // Initialize the loader
  async initialize() {
    try {
      await this.checkAuthentication();
      await this.getFormDigest();
      await this.preloadImages();
      await this.loadCardData();
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  // Check SharePoint authentication
  async checkAuthentication() {
    try {
      const response = await fetch('/_api/contextinfo', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
      
      if (!response.ok) {
        throw new Error(APP_CONFIG.errors.authenticationFailed);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Authentication check failed:', error);
      throw error;
    }
  }

  // Get form digest value for POST requests
  async getFormDigest() {
    try {
      const response = await fetch('/_api/contextinfo', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        throw new Error(APP_CONFIG.errors.sharePointError);
      }

      const data = await response.json();
      this.digestValue = data.d.GetContextWebInformation.FormDigestValue;
    } catch (error) {
      console.error('Failed to get form digest:', error);
      throw error;
    }
  }

  // Get image URL from SharePoint
  getImageUrl(imageName) {
    const { siteUrl, libraryName, imageFolder } = this.config.sharepoint;
    return `${siteUrl}/_layouts/15/getpreview.ashx?path=${libraryName}/${imageFolder}/${imageName}`;
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
        if (this.retryCount < APP_CONFIG.app.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.loadImage(imageName).then(resolve).catch(reject);
          }, APP_CONFIG.app.retryDelay);
        } else {
          reject(new Error(APP_CONFIG.errors.imageLoadFailed));
        }
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
      imageNames.add(this.config.sharepoint.cardBackImage);
      
      // Load all images
      await Promise.all(
        Array.from(imageNames).map(name => this.loadImage(name))
      );
    } catch (error) {
      console.error('Image preloading failed:', error);
      throw error;
    }
  }

  // Load card data from SharePoint list
  async loadCardData() {
    if (this.dataCache) {
      return this.dataCache;
    }

    try {
      const response = await fetch(`/_api/web/lists/getbytitle('${this.config.sharepoint.listName}')/items`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        throw new Error(APP_CONFIG.errors.dataLoadFailed);
      }

      const data = await response.json();
      this.dataCache = this.processCardData(data.d.results);
      return this.dataCache;
    } catch (error) {
      console.error('Card data loading failed:', error);
      throw error;
    }
  }

  // Process raw card data into application format
  processCardData(rawData) {
    return rawData.map(item => ({
      id: item.Id,
      title: item.Title,
      model: item.Model,
      vendor: item.Vendor,
      idealFor: item.IdealFor,
      starterPrompt: item.StarterPrompt,
      nextLevelPrompt: item.NextLevelPrompt,
      reflectionQuestion: item.ReflectionQuestion,
      frontImage: `${item.Title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
      backImage: this.config.sharepoint.cardBackImage
    }));
  }

  // Clear cache
  clearCache() {
    this.imageCache.clear();
    this.dataCache = null;
    this.retryCount = 0;
    this.digestValue = null;
  }
}

// Export the loader
window.SharePointLoader = SharePointLoader; 