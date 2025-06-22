// Product related types

// Main categories
export enum MainCategory {
  MAKEUP = 'Makeup',
  SKINCARE = 'Skincare',
  HAIRCARE = 'Haircare',
  PERFUME = 'Perfume',
  BODYCARE = 'Bodycare',
  ACCESSORIES = 'Accessories',
  OTHER = 'Other',
}

// Subcategory interface (for nested categories)
export interface SubCategory {
  id: string;
  name: string;
  parentId: string | null;
  children?: SubCategory[];
}

// Base product interface
export interface BaseProduct {
  id: string;
  name: string;
  brand: string;
  mainCategory: MainCategory;
  subCategories: string[]; // Array of subcategory IDs
  imageUrl: string;
  price?: number;
  purchaseDate?: string; // ISO date string
  details?: string;
  purchaseLink?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Collection product interface (extends base product)
export interface CollectionProduct extends BaseProduct {
  expirationDate?: string; // ISO date string
  isOpened?: boolean;
  openedDate?: string; // ISO date string
  rating?: number; // 1-5 rating
  usage?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  notes?: string;
}

// Wishlist product interface (extends base product)
export interface WishlistProduct extends BaseProduct {
  priority?: 'low' | 'medium' | 'high';
  addedFromUrl?: string;
}

// Product search filters
export interface ProductFilters {
  mainCategory?: MainCategory;
  subCategories?: string[]; // Array of subcategory IDs
  brand?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'brand' | 'date' | 'price' | 'expiration';
  sortOrder?: 'asc' | 'desc';
}

// Category tree type
export type CategoryTree = {
  [key in MainCategory]?: SubCategory[];
};

// Category path for breadcrumb navigation
export interface CategoryPath {
  id: string;
  name: string;
}
