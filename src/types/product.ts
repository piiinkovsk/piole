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
  children: SubCategory[];
}

// Category path for breadcrumb navigation
export interface CategoryPath {
  id: string;
  name: string;
  level: 'main' | 'sub1' | 'sub2' | 'sub3';
}

// Product filters interface
export interface ProductFilters {
  category?: MainCategory;
  categoryPath?: CategoryPath[]; // Full path from main category to specific subcategory
  brand?: string;
  priceFrom?: number;
  priceTo?: number;
  dateFrom?: Date;
  dateTo?: Date;
  expirationFrom?: Date;
  expirationTo?: Date;
  isOpened?: boolean;
  status?: 'all' | 'in_use' | 'not_started' | 'finished';
  priority?: 'all' | 'high' | 'medium' | 'low';
  sortBy?: 'name' | 'brand' | 'date' | 'price' | 'expiration';
  sortOrder?: 'asc' | 'desc';
}

// Category tree type for static data
export interface CategoryTreeNode {
  name: string;
  children?: { [key: string]: CategoryTreeNode };
}

export type CategoryTreeType = {
  [key in MainCategory]?: { [key: string]: CategoryTreeNode };
};

// Static category tree data
export const CategoryTree: CategoryTreeType = {
  [MainCategory.MAKEUP]: {
    'Lips': {
      name: 'Lips',
      children: {
        'Lip Gloss': {
          name: 'Lip Gloss',
          children: {
            'Matte': { name: 'Matte' },
            'Metallic': { name: 'Metallic' },
            'Shimmer': { name: 'Shimmer' },
            'Spicy': { name: 'Spicy' }
          }
        },
        'Lipstick': {
          name: 'Lipstick',
          children: {
            'Matte': { name: 'Matte' },
            'Cream': { name: 'Cream' },
            'Liquid': { name: 'Liquid' },
            'Metallic': { name: 'Metallic' }
          }
        },
        'Lip Liner': {
          name: 'Lip Liner',
          children: {
            'Pencil': { name: 'Pencil' },
            'Liquid': { name: 'Liquid' }
          }
        },
        'Lip Care': {
          name: 'Lip Care',
          children: {
            'Balm': { name: 'Balm' },
            'Scrub': { name: 'Scrub' },
            'Mask': { name: 'Mask' }
          }
        }
      }
    },
    'Eyes': {
      name: 'Eyes',
      children: {
        'Eyeshadow': {
          name: 'Eyeshadow',
          children: {
            'Palette': { name: 'Palette' },
            'Single': { name: 'Single' },
            'Cream': { name: 'Cream' },
            'Liquid': { name: 'Liquid' }
          }
        },
        'Eyeliner': {
          name: 'Eyeliner',
          children: {
            'Pencil': { name: 'Pencil' },
            'Liquid': { name: 'Liquid' },
            'Gel': { name: 'Gel' },
            'Pen': { name: 'Pen' }
          }
        }
      }
    }
  },
  [MainCategory.SKINCARE]: {
    'Cleansers': {
      name: 'Cleansers',
      children: {
        'Face Wash': {
          name: 'Face Wash',
          children: {
            'Gel': { name: 'Gel' },
            'Cream': { name: 'Cream' },
            'Foam': { name: 'Foam' },
            'Oil': { name: 'Oil' }
          }
        },
        'Makeup Remover': {
          name: 'Makeup Remover',
          children: {
            'Liquid': { name: 'Liquid' },
            'Balm': { name: 'Balm' },
            'Wipes': { name: 'Wipes' }
          }
        }
      }
    }
  }
  // ... other categories follow the same pattern
} as const;

// Base product interface
export interface BaseProduct {
  id: string;
  name: string;
  brand: string;
  mainCategory: MainCategory;
  categoryPath: CategoryPath[]; // Full path from main category to specific subcategory
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
  periodAfterOpening?: number; // months
  rating?: number; // 1-5 rating
  usage?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  notes?: string;
}

// Wishlist product interface (extends base product)
export interface WishlistProduct extends BaseProduct {
  priority?: 'low' | 'medium' | 'high';
  addedFromUrl?: string;
}
