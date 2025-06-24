import { MainCategory, ProductPreview } from './types';

// Configurations for known sites to extract product info
const SITE_CONFIGS = {
  'sephora.com': {
    productName: ['.css-1wd4jdi', '.css-1m4kpeu'],
    brand: ['.css-1m4kpeu', '.css-1m40ht1'],
    price: ['.css-7xdcwc', '.css-1oz9qb8'],
    image: ['.css-1675p02 img', '.css-15xbr3n img']
  },
  'ulta.com': {
    productName: ['.ProductMainSection__productName'],
    brand: ['.ProductMainSection__brandName'],
    price: ['.ProductPricing__price'],
    image: ['.ProductImagesSection__mainImage img']
  }
};

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProductInfo') {
    const productInfo = extractProductInfo();
    sendResponse(productInfo);
    return true; // Required for async response
  }
});

// Main function to extract product info from the page
function extractProductInfo(): ProductPreview {
  const hostname = window.location.hostname;
  const config = getConfigForSite(hostname);
  
  return {
    name: extractText(config.productName),
    brand: extractText(config.brand),
    price: extractPrice(config.price),
    imageUrl: extractImage(config.image),
    purchaseLink: window.location.href,
    mainCategory: guessMainCategory()
  };
}

// Get the configuration for the current site
function getConfigForSite(hostname: string): any {
  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (hostname.includes(domain)) {
      return config;
    }
  }
  
  // Generic fallback selectors for sites without specific configs
  return {
    productName: [
      'h1',
      '[class*="product"][class*="title"]',
      '[class*="product"][class*="name"]',
      '[itemprop="name"]'
    ],
    brand: [
      '[class*="brand"]',
      '[itemprop="brand"]'
    ],
    price: [
      '[class*="price"]',
      '[itemprop="price"]',
      '.price',
      '#price'
    ],
    image: [
      '[class*="product"][class*="image"] img',
      '[itemprop="image"]',
      '.product-image img',
      '#product-image img'
    ]
  };
}

// Extract text from multiple possible selectors
function extractText(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text) return text;
      }
    } catch (error) {
      console.warn('Error extracting text for selector:', selector, error);
    }
  }
  return '';
}

// Extract price from multiple possible selectors
function extractPrice(selectors: string[]): number | undefined {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text) {
          const price = parsePriceString(text);
          if (!isNaN(price)) return price;
        }
      }
    } catch (error) {
      console.warn('Error extracting price for selector:', selector, error);
    }
  }
  return undefined;
}

// Extract image URL from multiple possible selectors
function extractImage(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector) as HTMLImageElement;
      if (element && element.src) {
        return element.src;
      }
    } catch (error) {
      console.warn('Error extracting image for selector:', selector, error);
    }
  }
  return undefined;
}

// Parse a price string to number
function parsePriceString(priceStr: string): number {
  // Remove currency symbols and other non-numeric characters
  const cleaned = priceStr.replace(/[^0-9.,]/g, '');
  // Handle different number formats (1,234.56 or 1.234,56)
  const normalized = cleaned.includes(',') ? 
    cleaned.replace('.', '').replace(',', '.') : 
    cleaned.replace(',', '');
  return parseFloat(normalized);
}

// Try to guess the main category based on page content
function guessMainCategory(): MainCategory {
  const pageText = document.body.textContent?.toLowerCase() || '';
  
  const categoryKeywords: { [key in MainCategory]: string[] } = {
    [MainCategory.MAKEUP]: ['makeup', 'cosmetics', 'lipstick', 'mascara', 'foundation', 'eyeshadow'],
    [MainCategory.SKINCARE]: ['skincare', 'moisturizer', 'serum', 'cleanser', 'toner'],
    [MainCategory.HAIRCARE]: ['hair', 'shampoo', 'conditioner', 'styling'],
    [MainCategory.BODYCARE]: ['body', 'lotion', 'cream', 'wash', 'scrub'],
    [MainCategory.FRAGRANCE]: ['perfume', 'fragrance', 'cologne', 'scent'],
    [MainCategory.NAILCARE]: ['nail', 'polish', 'lacquer', 'manicure'],
    [MainCategory.TOOLS]: ['brush', 'sponge', 'applicator', 'tool'],
    [MainCategory.OTHER]: []
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => pageText.includes(keyword))) {
      return category as MainCategory;
    }
  }

  return MainCategory.OTHER;
}
