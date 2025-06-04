# SharePoint Integration Guide

## 1. Image Loading Strategy

### 1.1 SharePoint Image Handling
```typescript
class SharePointImageLoader {
  private readonly siteUrl: string;
  private readonly libraryName: string;

  constructor(siteUrl: string, libraryName: string) {
    this.siteUrl = siteUrl;
    this.libraryName = libraryName;
  }

  // Get image URL from SharePoint
  getImageUrl(imageName: string): string {
    return `${this.siteUrl}/_layouts/15/getpreview.ashx?path=${this.libraryName}/${imageName}`;
  }

  // Preload images with SharePoint authentication
  async preloadImages(imageNames: string[]): Promise<void> {
    const imageUrls = imageNames.map(name => this.getImageUrl(name));
    await Promise.all(imageUrls.map(url => this.loadImage(url)));
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
}
```

### 1.2 Loading States
```html
<div class="card-container">
  <div class="loading-overlay">
    <div class="spinner"></div>
  </div>
  <!-- Card content -->
</div>
```

```css
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

## 2. SharePoint Styling Constraints

### 2.1 CSS Isolation
```css
/* Use specific class names to avoid conflicts */
.nates-ai-cards {
  /* All styles scoped to this class */
}

.nates-ai-cards .card-container {
  /* Card styles */
}

.nates-ai-cards .preview {
  /* Preview styles */
}
```

### 2.2 SharePoint Theme Integration
```typescript
class SharePointThemeManager {
  // Get SharePoint theme colors
  getThemeColors(): ThemeColors {
    return {
      primary: getComputedStyle(document.documentElement)
        .getPropertyValue('--sp-color-primary'),
      background: getComputedStyle(document.documentElement)
        .getPropertyValue('--sp-color-background'),
      // Add other theme colors
    };
  }

  // Apply theme to cards
  applyTheme(colors: ThemeColors) {
    document.documentElement.style.setProperty(
      '--card-highlight-color',
      colors.primary
    );
    // Apply other theme properties
  }
}
```

## 3. Browser Compatibility

### 3.1 Feature Detection
```typescript
class BrowserCompatibility {
  static checkFeatures(): CompatibilityReport {
    return {
      has3DTransforms: this.check3DTransforms(),
      hasFlexbox: this.checkFlexbox(),
      hasGrid: this.checkGrid(),
      hasIntersectionObserver: this.checkIntersectionObserver()
    };
  }

  static check3DTransforms(): boolean {
    const style = document.createElement('div').style;
    return 'transform' in style && 'perspective' in style;
  }

  // Add other feature checks
}
```

### 3.2 Fallback Implementation
```typescript
class CardFallback {
  static implementFallback(report: CompatibilityReport) {
    if (!report.has3DTransforms) {
      this.implement2DFallback();
    }
    if (!report.hasFlexbox) {
      this.implementTableLayout();
    }
    // Add other fallbacks
  }

  private static implement2DFallback() {
    // Implement 2D card flip
  }

  private static implementTableLayout() {
    // Implement table-based layout
  }
}
```

## 4. SharePoint Security Model

### 4.1 Content Security Policy
```typescript
class SecurityManager {
  // Check CSP restrictions
  static checkCSPRestrictions(): SecurityReport {
    return {
      hasInlineScripts: this.checkInlineScripts(),
      hasExternalScripts: this.checkExternalScripts(),
      hasInlineStyles: this.checkInlineStyles()
    };
  }

  // Handle CSP restrictions
  static handleRestrictions(report: SecurityReport) {
    if (!report.hasInlineScripts) {
      this.moveScriptsToExternal();
    }
    if (!report.hasInlineStyles) {
      this.moveStylesToExternal();
    }
  }
}
```

### 4.2 Authentication Flow
```typescript
class AuthenticationManager {
  // Check authentication status
  static async checkAuth(): Promise<AuthStatus> {
    try {
      const response = await fetch('/_api/contextinfo', {
        credentials: 'same-origin'
      });
      return {
        isAuthenticated: response.ok,
        userInfo: await response.json()
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error.message
      };
    }
  }

  // Handle authentication
  static async handleAuth(): Promise<void> {
    const status = await this.checkAuth();
    if (!status.isAuthenticated) {
      // Redirect to login or show error
    }
  }
}
```

## 5. Performance Optimization

### 5.1 Image Optimization
```typescript
class ImageOptimizer {
  // Optimize image loading
  static async optimizeImages(images: string[]): Promise<void> {
    const optimizedImages = images.map(img => ({
      url: img,
      size: this.calculateOptimalSize(img)
    }));

    // Preload optimized images
    await Promise.all(
      optimizedImages.map(img => this.preloadImage(img.url, img.size))
    );
  }

  private static calculateOptimalSize(imageUrl: string): ImageSize {
    // Calculate optimal size based on viewport
    return {
      width: Math.min(window.innerWidth * 0.6, 800),
      height: Math.min(window.innerHeight * 0.8, 600)
    };
  }
}
```

### 5.2 Caching Strategy
```typescript
class CacheManager {
  private static readonly CACHE_KEY = 'nates-ai-cards-cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Cache card data
  static cacheCardData(data: CardData[]): void {
    const cache = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
  }

  // Get cached data
  static getCachedData(): CardData[] | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return null;

    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }

    return data;
  }
}
```

## 6. Implementation Checklist

### 6.1 SharePoint Setup
- [ ] Configure document library
- [ ] Set up permissions
- [ ] Configure content types
- [ ] Set up version control

### 6.2 Security Configuration
- [ ] Review CSP settings
- [ ] Configure authentication
- [ ] Set up error handling
- [ ] Implement logging

### 6.3 Performance Setup
- [ ] Configure caching
- [ ] Set up image optimization
- [ ] Implement lazy loading
- [ ] Configure monitoring

### 6.4 Testing Requirements
- [ ] Test in SharePoint environment
- [ ] Verify security settings
- [ ] Check performance metrics
- [ ] Validate user access 