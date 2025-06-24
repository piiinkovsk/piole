// @ts-check
import { MainCategory, CategoryTree } from './types';

const categoryData = CategoryTree;
let selectedCategories = [];
let currentTab = 'wishlist';

// Initialize the form
document.addEventListener('DOMContentLoaded', async () => {
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // Initialize category tree
  const categoryTree = document.getElementById('category-tree');
  renderCategoryTree(categoryTree, categoryData);

  // Set up form submission
  const form = document.getElementById('product-form');
  form.addEventListener('submit', handleSubmit);

  // Try to extract product info from page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'getProductInfo' }, (response) => {
      if (response) {
        populateForm(response);
      }
    });
  }
});

// Switch between wishlist and collection tabs
function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Render the full category tree with checkboxes
function renderCategoryTree(container, categories) {
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
function createCategoryItem(name, details, path) {
  const item = document.createElement('div');
  item.className = 'category-item';

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = name;
  checkbox.dataset.path = JSON.stringify([...path, name]);
  checkbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    const categoryPath = JSON.parse(e.target.dataset.path);
    handleSubcategorySelect(categoryPath, checked);
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
function handleCategorySelect(category) {
  selectedCategories = [category];
  updateForm();
}

// Handle subcategory selection
function handleSubcategorySelect(path, checked) {
  if (checked) {
    selectedCategories = path;
  } else {
    selectedCategories = selectedCategories.slice(0, selectedCategories.indexOf(path[path.length - 1]));
  }
  updateForm();
}

// Update form based on selections
function updateForm() {
  // Implementation will update form state and validation
}

// Populate form with extracted product info
function populateForm(productInfo) {
  const { name, brand, price, imageUrl } = productInfo;
  
  if (name) document.getElementById('product-name').value = name;
  if (brand) document.getElementById('product-brand').value = brand;
  if (price) document.getElementById('product-price').value = price.toString();
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('product-name').value,
    brand: document.getElementById('product-brand').value,
    price: parseFloat(document.getElementById('product-price').value) || undefined,
    mainCategory: selectedCategories[0],
    categoryPath: selectedCategories.map((cat, index) => ({
      name: cat,
      level: index === 0 ? 'main' : index === selectedCategories.length - 1 ? 'detail' : 'sub'
    })),
    // Get current page URL as purchase link
    purchaseLink: window.location.href
  };

  // Send message to background script to save the product
  chrome.runtime.sendMessage({
    action: 'saveProduct',
    data: {
      ...formData,
      type: currentTab // 'wishlist' or 'collection'
    }
  }, (response) => {
    if (response.success) {
      // Show success message
      window.close();
    } else {
      // Show error message
    }
  });
}
