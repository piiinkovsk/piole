import { MainCategory, CategoryTree, CategoryPath, ProductPreview } from './types';

declare global {
  interface Window {
    chrome: {
      tabs: {
        query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<chrome.tabs.Tab[]>;
        sendMessage: (tabId: number, message: any) => Promise<any>;
      };
      runtime: {
        sendMessage: (message: any) => Promise<any>;
      };
    };
  }
}

const categoryData = CategoryTree;
let selectedCategories: string[] = [];
let currentTab: 'wishlist' | 'collection' = 'wishlist';

// Initialize the form
document.addEventListener('DOMContentLoaded', async () => {
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tabName = target.dataset.tab as 'wishlist' | 'collection';
      if (tabName) {
        switchTab(tabName);
      }
    });
  });

  // Initialize category tree
  const categoryTree = document.getElementById('category-tree');
  if (categoryTree) {
    renderCategoryTree(categoryTree, categoryData);
  }

  // Set up form submission
  const form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Try to extract product info from page
  try {
    const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const response = await window.chrome.tabs.sendMessage(tab.id, { action: 'getProductInfo' });
      if (response) {
        populateForm(response);
      }
    }
  } catch (error) {
    console.error('Error querying tabs:', error);
  }
});

// Switch between wishlist and collection tabs
function switchTab(tabName: 'wishlist' | 'collection'): void {
  currentTab = tabName;
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab instanceof HTMLElement && tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Render the full category tree with checkboxes
function renderCategoryTree(container: HTMLElement, categories: typeof CategoryTree): void {
  container.innerHTML = '';

  // Create main category buttons
  Object.entries(categories).forEach(([mainCat, subCats]) => {
    const mainItem = document.createElement('div');
    mainItem.className = 'category-item main-category';

    const mainLabel = document.createElement('label');
    const mainCheckbox = document.createElement('input');
    mainCheckbox.type = 'radio';
    mainCheckbox.name = 'main-category';
    mainCheckbox.value = mainCat;
    mainCheckbox.addEventListener('change', () => handleCategorySelect(mainCat));

    mainLabel.appendChild(mainCheckbox);
    mainLabel.appendChild(document.createTextNode(mainCat));
    mainItem.appendChild(mainLabel);

    // Create subcategory container
    const subContainer = document.createElement('div');
    subContainer.className = 'subcategory';
    mainItem.appendChild(subContainer);

    // Only show subcategories if we have any
    if (Object.keys(subCats).length > 0) {
      Object.entries(subCats).forEach(([subCat, details]) => {
        const subItem = createCategoryItem(subCat, details, [mainCat]);
        subContainer.appendChild(subItem);
      });
    }

    container.appendChild(mainItem);
  });
}

// Create a category item with nested structure
function createCategoryItem(name: string, details: any, path: string[]): HTMLElement {
  const item = document.createElement('div');
  item.className = 'category-item';

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = name;
  checkbox.dataset.path = JSON.stringify([...path, name]);
  checkbox.addEventListener('change', (e) => {
    if (e.target instanceof HTMLInputElement) {
      const checked = e.target.checked;
      const pathData = e.target.dataset.path;
      if (pathData) {
        const categoryPath = JSON.parse(pathData);
        handleSubcategorySelect(categoryPath, checked);
      }
    }
  });

  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(name));
  item.appendChild(label);

  if (details.children) {
    const subContainer = document.createElement('div');
    subContainer.className = 'subcategory';
    Object.entries(details.children).forEach(([childName, childDetails]) => {
      const childItem = createCategoryItem(childName, childDetails, [...path, name]);
      subContainer.appendChild(childItem);
    });
    item.appendChild(subContainer);
  }

  return item;
}

// Handle category selection
function handleCategorySelect(category: string): void {
  selectedCategories = [category];
  updateForm();
}

// Handle subcategory selection
function handleSubcategorySelect(path: string[], checked: boolean): void {
  if (checked) {
    selectedCategories = path;
  } else {
    const index = selectedCategories.indexOf(path[path.length - 1]);
    if (index !== -1) {
      selectedCategories = selectedCategories.slice(0, index);
    }
  }
  updateForm();
}

// Update form based on selections
function updateForm(): void {
  // Implementation will update form state and validation
}

// Populate form with extracted product info
function populateForm(productInfo: ProductPreview): void {
  const nameInput = document.getElementById('product-name') as HTMLInputElement;
  const brandInput = document.getElementById('product-brand') as HTMLInputElement;
  const priceInput = document.getElementById('product-price') as HTMLInputElement;
  
  if (nameInput && productInfo.name) nameInput.value = productInfo.name;
  if (brandInput && productInfo.brand) brandInput.value = productInfo.brand;
  if (priceInput && productInfo.price) priceInput.value = productInfo.price.toString();
}

// Handle form submission
async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const nameInput = document.getElementById('product-name') as HTMLInputElement;
  const brandInput = document.getElementById('product-brand') as HTMLInputElement;
  const priceInput = document.getElementById('product-price') as HTMLInputElement;

  if (!nameInput || !brandInput || !priceInput) {
    console.error('Required form elements not found');
    return;
  }

  const formData = {
    name: nameInput.value,
    brand: brandInput.value,
    price: priceInput.value ? parseFloat(priceInput.value) : undefined,
    mainCategory: selectedCategories[0] as MainCategory,
    categoryPath: selectedCategories.map((cat, index) => ({
      name: cat,
      level: index === 0 ? 'main' : index === selectedCategories.length - 1 ? 'detail' : 'sub'
    } as CategoryPath)),
    purchaseLink: window.location.href
  };

  try {
    const response = await window.chrome.runtime.sendMessage({
      action: 'saveProduct',
      data: {
        ...formData,
        type: currentTab
      }
    });

    if (response.success) {
      window.close();
    } else {
      // Show error message
      console.error('Failed to save product:', response.error);
    }
  } catch (error) {
    console.error('Error saving product:', error);
  }
}
