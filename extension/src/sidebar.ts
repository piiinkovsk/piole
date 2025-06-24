import { MainCategory, CategoryTree, CategoryPath } from './types';

const categoryData = CategoryTree;
let selectedCategories: string[] = [];
let currentTab: 'wishlist' | 'collection' = 'wishlist';

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
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getProductInfo' }, (response) => {
      if (response) {
        populateForm(response);
      }
    });
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

// Render the full category tree with improved hierarchical display
function renderCategoryTree(container: HTMLElement, categories: typeof CategoryTree): void {
  container.innerHTML = '';

  Object.entries(categories).forEach(([mainCat, subCats]) => {
    const mainGroup = document.createElement('div');
    mainGroup.className = 'category-group';

    const mainHeader = document.createElement('div');
    mainHeader.className = 'category-header';

    const mainRadio = document.createElement('input');
    mainRadio.type = 'radio';
    mainRadio.name = 'main-category';
    mainRadio.value = mainCat;
    mainRadio.id = `main-${mainCat}`;
    mainRadio.addEventListener('change', () => handleCategorySelect(mainCat));

    const mainLabel = document.createElement('label');
    mainLabel.htmlFor = `main-${mainCat}`;
    mainLabel.textContent = mainCat;

    mainHeader.appendChild(mainRadio);
    mainHeader.appendChild(mainLabel);
    mainGroup.appendChild(mainHeader);

    if (Object.keys(subCats).length > 0) {
      const subTree = document.createElement('div');
      subTree.className = 'subcategory-tree';

      Object.entries(subCats).forEach(([subCat, details]) => {
        const subGroup = createSubcategoryGroup(subCat, details, [mainCat]);
        subTree.appendChild(subGroup);
      });

      mainGroup.appendChild(subTree);
    }

    container.appendChild(mainGroup);
  });
}

function createSubcategoryGroup(name: string, details: any, path: string[]): HTMLElement {
  const group = document.createElement('div');
  group.className = 'subcategory-group';

  const header = document.createElement('div');
  header.className = 'subcategory-header';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = name;
  checkbox.id = `category-${path.join('-')}-${name}`;
  checkbox.dataset.path = JSON.stringify([...path, name]);
  checkbox.addEventListener('change', (e) => {
    if (e.target instanceof HTMLInputElement) {
      handleSubcategorySelect(JSON.parse(e.target.dataset.path!), e.target.checked);
    }
  });

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = name;

  header.appendChild(checkbox);
  header.appendChild(label);
  group.appendChild(header);

  if (details.children) {
    const childContainer = document.createElement('div');
    childContainer.className = 'detail-categories';

    Object.entries(details.children).forEach(([childName, childDetails]) => {
      const childGroup = createSubcategoryGroup(childName, childDetails, [...path, name]);
      childContainer.appendChild(childGroup);
    });

    group.appendChild(childContainer);
  }

  return group;
}

// Handle main category selection
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
  // Update preview and validation state
  const saveButton = document.querySelector('.button[type="submit"]') as HTMLButtonElement;
  const previewCategory = document.getElementById('preview-category');
  
  if (previewCategory) {
    previewCategory.textContent = selectedCategories.join(' > ');
  }
  
  if (saveButton) {
    saveButton.disabled = !validateForm();
  }
}

// Validate form data
function validateForm(): boolean {
  const nameInput = document.getElementById('product-name') as HTMLInputElement;
  const brandInput = document.getElementById('product-brand') as HTMLInputElement;

  return !!(
    nameInput?.value &&
    brandInput?.value &&
    selectedCategories.length > 0
  );
}

// Populate form with extracted product info
function populateForm(productInfo: any): void {
  const nameInput = document.getElementById('product-name') as HTMLInputElement;
  const brandInput = document.getElementById('product-brand') as HTMLInputElement;
  const priceInput = document.getElementById('product-price') as HTMLInputElement;
  const previewImage = document.getElementById('preview-image') as HTMLImageElement;
  const previewTitle = document.getElementById('preview-title');
  const previewPrice = document.getElementById('preview-price');

  if (nameInput && productInfo.name) {
    nameInput.value = productInfo.name;
  }
  if (brandInput && productInfo.brand) {
    brandInput.value = productInfo.brand;
  }
  if (priceInput && productInfo.price) {
    priceInput.value = productInfo.price.toString();
  }
  if (previewImage && productInfo.imageUrl) {
    previewImage.src = productInfo.imageUrl;
  }
  if (previewTitle) {
    previewTitle.textContent = productInfo.name || 'Product Name';
  }
  if (previewPrice) {
    previewPrice.textContent = productInfo.price ? 
      `Price: ${productInfo.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : 
      'Price: N/A';
  }

  if (productInfo.mainCategory) {
    const mainRadio = document.querySelector(`input[value="${productInfo.mainCategory}"]`) as HTMLInputElement;
    if (mainRadio) {
      mainRadio.checked = true;
      handleCategorySelect(productInfo.mainCategory);
    }
  }
}

// Handle form submission
async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const nameInput = document.getElementById('product-name') as HTMLInputElement;
  const brandInput = document.getElementById('product-brand') as HTMLInputElement;
  const priceInput = document.getElementById('product-price') as HTMLInputElement;
  const previewImage = document.getElementById('preview-image') as HTMLImageElement;

  if (!validateForm()) {
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
    imageUrl: previewImage.src,
    purchaseLink: window.location.href
  };

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveProduct',
      data: {
        ...formData,
        type: currentTab
      }
    });

    if (response.success) {
      showSuccessMessage();
      resetForm();
    } else {
      showErrorMessage(response.error);
    }
  } catch (error) {
    showErrorMessage('Failed to save product');
    console.error('Error saving product:', error);
  }
}

function showSuccessMessage(): void {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.textContent = 'Product saved successfully!';
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 3000);
}

function showErrorMessage(error: string): void {
  const message = document.createElement('div');
  message.className = 'error-message';
  message.textContent = error;
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 5000);
}

function resetForm(): void {
  const form = document.getElementById('product-form') as HTMLFormElement;
  if (form) {
    form.reset();
  }
  selectedCategories = [];
  updateForm();
}
