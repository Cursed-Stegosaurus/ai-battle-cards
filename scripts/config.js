// Development Mode Configuration
const DEV_MODE = false; // Set to false for SharePoint deployment

// SharePoint Configuration
const SHAREPOINT_CONFIG = {
  siteUrl: window.location.origin, // Will use current SharePoint site URL
  libraryName: 'AI Battle Cards',
  imageFolder: 'Cards',
  cardBackImage: 'card back.jpg',
  listName: 'Cards' // SharePoint list name for card data
};

// Local Development Configuration
const LOCAL_CONFIG = {
  imageFolder: 'Cards',
  cardBackImage: 'card back.jpg',
  dataFile: 'cards.json'
};

// Application Configuration
const APP_CONFIG = {
  cardWidth: 220,
  cardHeight: 340,
  previewScale: 1.5,
  animationDuration: 600,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  maxRetries: 3,
  retryDelay: 1000,
  isDevMode: DEV_MODE,
  sharePointApiVersion: 'v1.0' // SharePoint REST API version
};

// Card Data Structure
const CARD_SCHEMA = {
  id: 'string',
  title: 'string',
  model: 'string',
  vendor: 'string',
  idealFor: 'string',
  starterPrompt: 'string',
  nextLevelPrompt: 'string',
  reflectionQuestion: 'string',
  frontImage: 'string',
  backImage: 'string'
};

// Error Messages
const ERROR_MESSAGES = {
  imageLoadFailed: 'Failed to load card image',
  dataLoadFailed: 'Failed to load card data',
  authenticationFailed: 'Authentication failed',
  invalidCardData: 'Invalid card data format',
  networkError: 'Network error occurred',
  cacheError: 'Cache error occurred',
  sharePointError: 'SharePoint operation failed'
};

// Export configuration
window.APP_CONFIG = {
  sharepoint: SHAREPOINT_CONFIG,
  local: LOCAL_CONFIG,
  app: APP_CONFIG,
  schema: CARD_SCHEMA,
  errors: ERROR_MESSAGES
}; 