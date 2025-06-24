import { ProductPreview } from './types';

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveProduct') {
    handleSaveProduct(message.data)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async response
  }
});

// Function to save product to app storage
async function handleSaveProduct(data: ProductPreview & { type: 'wishlist' | 'collection' }): Promise<any> {
  // Send data to app endpoint
  // This will need to be updated with your actual app's API endpoint
  const API_ENDPOINT = 'http://localhost:3000/api/products';
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: data,
        destination: data.type
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save product');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// Optional: Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Set up any necessary extension state
  console.log('Piole Extension installed');
});

// Optional: Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(error => {
      console.error('Failed to open side panel:', error);
      // Fallback to popup if side panel fails
      chrome.action.setPopup({ tabId: tab.id, popup: 'src/popup.html' });
    });
  }
});
